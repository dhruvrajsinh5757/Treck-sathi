import express from 'express';
import multer from 'multer';
import path from 'path';
import Trip from '../models/Trip.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

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
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
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

