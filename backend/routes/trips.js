import express from 'express';
import multer from 'multer';
import path from 'path';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function withDerivedTripFields(tripDoc) {
  const tripObj = tripDoc.toObject ? tripDoc.toObject() : { ...tripDoc };
  if (!tripObj.lifecycleStatus) {
    tripObj.lifecycleStatus = 'planned';
  }
  tripObj.availableSeats =
    typeof tripObj.maxMembers === 'number'
      ? Math.max(0, tripObj.maxMembers - (tripObj.participants?.length || 0))
      : null;
  return tripObj;
}

function isOrganizer(trip, userId) {
  return String(trip.createdBy?._id || trip.createdBy) === String(userId);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i.test(path.extname(file.originalname));
    if (allowed) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// GET /api/trips - list trips for feed
router.get('/trips', protect, async (req, res) => {
  try {
    const trips = await Trip.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email profilePhoto fitnessLevel');

    res.json({
      success: true,
      trips,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to load trips',
    });
  }
});

// GET /api/trips/my?lifecycle=planned|running|completed - trips where user is participant
router.get('/trips/my', protect, async (req, res) => {
  try {
    const { lifecycle } = req.query;
    const filter = { participants: req.user._id };
    const lifecycleValue =
      lifecycle && ['planned', 'running', 'completed'].includes(String(lifecycle))
        ? String(lifecycle)
        : null;

    if (lifecycleValue) {
      // Treat missing lifecycle as 'planned' for backward compatibility
      if (lifecycleValue === 'planned') {
        filter.$or = [{ lifecycleStatus: 'planned' }, { lifecycleStatus: { $exists: false } }];
      } else {
        filter.lifecycleStatus = lifecycleValue;
      }
    }

    const trips = await Trip.find(filter)
      .sort({ startDate: 1 })
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');

    res.json({ success: true, trips: trips.map(withDerivedTripFields) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load your trips' });
  }
});

// GET /api/trips/current - running trip if any, else nearest upcoming planned trip (joined/created)
router.get('/trips/current', protect, async (req, res) => {
  try {
    const baseFilter = {
      participants: req.user._id,
      status: { $ne: 'draft' },
    };

    const running = await Trip.findOne({ ...baseFilter, lifecycleStatus: 'running' })
      .sort({ startedAt: -1, startDate: 1 })
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');

    if (running) {
      return res.json({ success: true, trip: withDerivedTripFields(running) });
    }

    const upcoming = await Trip.findOne({ ...baseFilter, lifecycleStatus: 'planned' })
      .sort({ startDate: 1 })
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');

    return res.json({ success: true, trip: upcoming ? withDerivedTripFields(upcoming) : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load current trip' });
  }
});

// GET /api/trips/:id - trip details
router.get('/trips/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Trip id is required' });
    }

    const trip = await Trip.findById(id)
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, trip: withDerivedTripFields(trip) });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to load trip details',
    });
  }
});

// GET /api/trips/:id/participants - who joined (with profiles)
router.get('/trips/:id/participants', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id)
      .select('participants maxMembers createdBy lifecycleStatus startedAt endedAt title destination startDate endDate')
      .populate('participants', 'name profilePhoto fitnessLevel location bio');

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const tripObj = withDerivedTripFields(trip);
    res.json({
      success: true,
      trip: {
        _id: tripObj._id,
        title: tripObj.title,
        destination: tripObj.destination,
        startDate: tripObj.startDate,
        endDate: tripObj.endDate,
        lifecycleStatus: tripObj.lifecycleStatus,
        startedAt: tripObj.startedAt,
        endedAt: tripObj.endedAt,
        maxMembers: tripObj.maxMembers,
        availableSeats: tripObj.availableSeats,
        participants: tripObj.participants || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load participants' });
  }
});

// POST /api/trips/:id/start - organizer starts trip (planned -> running)
router.post('/trips/:id/start', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOrganizer(trip, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the trip organizer can start the trip' });
    }
    if (trip.lifecycleStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Trip is already completed' });
    }
    if (trip.lifecycleStatus !== 'running') {
      trip.lifecycleStatus = 'running';
      trip.startedAt = trip.startedAt || new Date();
      await trip.save();
    }
    const populated = await Trip.findById(trip._id)
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');
    res.json({ success: true, message: 'Trip started', trip: withDerivedTripFields(populated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to start trip' });
  }
});

// POST /api/trips/:id/complete - organizer completes trip (running/planned -> completed)
router.post('/trips/:id/complete', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOrganizer(trip, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the trip organizer can complete the trip' });
    }
    if (trip.lifecycleStatus === 'completed') {
      return res.json({ success: true, message: 'Trip already completed' });
    }
    trip.lifecycleStatus = 'completed';
    trip.endedAt = new Date();
    await trip.save();
    const populated = await Trip.findById(trip._id)
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');
    res.json({ success: true, message: 'Trip marked as completed', trip: withDerivedTripFields(populated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to complete trip' });
  }
});

// POST /api/trips/:id/checklist - organizer adds checklist item
router.post('/trips/:id/checklist', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: 'Checklist text is required' });
    }
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOrganizer(trip, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the organizer can edit checklist' });
    }
    trip.checklist.push({ text: String(text).trim(), createdBy: req.user._id, createdAt: new Date() });
    await trip.save();
    const populated = await Trip.findById(trip._id)
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');
    res.json({ success: true, message: 'Checklist item added', trip: withDerivedTripFields(populated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to add checklist item' });
  }
});

// PATCH /api/trips/:id/checklist/:itemId - organizer updates checklist item (toggle done / edit text)
router.patch('/trips/:id/checklist/:itemId', protect, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { text, done } = req.body;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isOrganizer(trip, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the organizer can edit checklist' });
    }
    const item = trip.checklist.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });

    if (typeof text === 'string') {
      const next = String(text).trim();
      if (!next) return res.status(400).json({ success: false, message: 'Checklist text cannot be empty' });
      item.text = next;
    }
    if (typeof done === 'boolean') {
      item.done = done;
      item.doneAt = done ? new Date() : undefined;
    }
    await trip.save();

    const populated = await Trip.findById(trip._id)
      .populate('createdBy', 'name email profilePhoto fitnessLevel location')
      .populate('participants', 'name profilePhoto fitnessLevel location');
    res.json({ success: true, message: 'Checklist updated', trip: withDerivedTripFields(populated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update checklist' });
  }
});

// POST /api/trips - create a trip (multipart)
router.post(
  '/trips',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalPhotos', maxCount: 10 },
    { name: 'routeMap', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        destination,
        startDate,
        endDate,
        duration,
        difficulty,
        tripType,
        description,
        maxMembers,
        requiredExperience,
        requiredFitness,
        genderPreference,
        minAge,
        maxAge,
        budget,
        costIncludes,
        meetingPoint,
        transportMode,
        thingsToCarry,
        safetyGuidelines,
        emergencyContact,
        cancellationPolicy,
        status,
        visibility,
        autoApproveRequests,
      } = req.body;

      const coverImageFile = req.files?.coverImage?.[0];
      if (!coverImageFile) {
        return res.status(400).json({ success: false, message: 'Cover image is required' });
      }
      if (!title || !destination || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Title, destination, start date and end date are required' });
      }

      const additionalPhotos = (req.files?.additionalPhotos || []).map((f) => `/uploads/${f.filename}`);
      const routeMapFile = req.files?.routeMap?.[0];

      const parsedCostIncludes = costIncludes ? JSON.parse(costIncludes) : undefined;

      const trip = await Trip.create({
        title: String(title).trim(),
        destination: String(destination).trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: duration ? Number(duration) : 0,
        difficulty: difficulty || 'Medium',
        tripType: tripType || 'Trek',
        description: description || '',
        maxMembers: maxMembers ? Number(maxMembers) : undefined,
        requiredExperience: requiredExperience || 'Beginner',
        requiredFitness: requiredFitness || 'Medium',
        genderPreference: genderPreference || '',
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        budget: budget ? Number(budget) : undefined,
        costIncludes: parsedCostIncludes,
        meetingPoint: meetingPoint || '',
        transportMode: transportMode || 'Bus',
        thingsToCarry: thingsToCarry || '',
        safetyGuidelines: safetyGuidelines || '',
        emergencyContact: emergencyContact || '',
        cancellationPolicy: cancellationPolicy || '',
        status: status || 'draft',
        visibility: visibility || 'public',
        autoApproveRequests: autoApproveRequests === 'true',
        lifecycleStatus: 'planned',
        coverImage: `/uploads/${coverImageFile.filename}`,
        additionalPhotos,
        routeMap: routeMapFile ? `/uploads/${routeMapFile.filename}` : '',
        createdBy: req.user._id,
        date: new Date(startDate),
        participants: [req.user._id],
      });

      const populated = await Trip.findById(trip._id).populate('createdBy', 'name email profilePhoto fitnessLevel');
      res.status(201).json({ success: true, message: 'Trip created', trip: populated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create trip' });
    }
  }
);

// POST /api/join/:tripId - request to join a trip
router.post('/join/:tripId', protect, async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).populate('createdBy', 'name');
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    if (trip.lifecycleStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This trip is already completed' });
    }
    if (trip.lifecycleStatus === 'running') {
      return res.status(400).json({ success: false, message: 'This trip is already running' });
    }

    const isAlreadyParticipant = trip.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (isAlreadyParticipant) {
      return res.json({
        success: true,
        message: 'You have already joined this trip',
      });
    }

    if (
      typeof trip.maxMembers === 'number' &&
      trip.maxMembers > 0 &&
      trip.participants.length >= trip.maxMembers
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Trip is already full' });
    }

    trip.participants.push(req.user._id);
    await trip.save();

    // Notify trip organizer that someone joined
    if (trip.createdBy && String(trip.createdBy._id) !== String(req.user._id)) {
      await Notification.create({
        userId: trip.createdBy._id,
        actorId: req.user._id,
        type: 'trip_join',
        message: `${req.user.name || 'Someone'} joined your trip ${trip.title || trip.destination || ''}`,
      });
    }

    res.json({
      success: true,
      message: 'Join request successful',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to join trip',
    });
  }
});

export default router;

