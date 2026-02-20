import express from 'express';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/search/trips - Search trips with advanced filters
router.get('/trips', protect, async (req, res) => {
  try {
    const {
      query,
      destination,
      startDate,
      endDate,
      difficulty,
      tripType,
      minBudget,
      maxBudget,
      duration,
      requiredExperience,
      requiredFitness,
      genderPreference,
      minAge,
      maxAge,
      availableSeats,
      status = 'published',
    } = req.query;

    const filters = {};

    // Status filter - only show published trips
    if (status) {
      filters.status = status;
    }

    // Text search on title and destination
    if (query || destination) {
      filters.$or = [
        { title: { $regex: query || destination || '', $options: 'i' } },
        { destination: { $regex: query || destination || '', $options: 'i' } },
      ];
    }

    // Date filters
    if (startDate) {
      filters.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filters.endDate = { $lte: new Date(endDate) };
    }

    // Difficulty filter
    if (difficulty) {
      const difficultyMap = {
        Easy: ['Easy'],
        Medium: ['Medium', 'Moderate'],
        Hard: ['Hard', 'Extreme'],
      };
      filters.difficulty = difficultyMap[difficulty]
        ? { $in: difficultyMap[difficulty] }
        : difficulty;
    }

    // Trip type filter
    if (tripType) {
      filters.tripType = tripType;
    }

    // Budget range
    if (minBudget || maxBudget) {
      filters.budget = {};
      if (minBudget) filters.budget.$gte = Number(minBudget);
      if (maxBudget) filters.budget.$lte = Number(maxBudget);
    }

    // Duration filter
    if (duration) {
      const durationNum = Number(duration);
      if (duration === '1-3') {
        filters.duration = { $gte: 1, $lte: 3 };
      } else if (duration === '4-7') {
        filters.duration = { $gte: 4, $lte: 7 };
      } else if (duration === '7+') {
        filters.duration = { $gte: 7 };
      }
    }

    // Required experience
    if (requiredExperience) {
      filters.requiredExperience = requiredExperience;
    }

    // Required fitness
    if (requiredFitness) {
      filters.requiredFitness = requiredFitness;
    }

    // Gender preference
    if (genderPreference) {
      filters.genderPreference = genderPreference;
    }

    // Age range
    if (minAge || maxAge) {
      filters.$or = filters.$or || [];
      if (minAge) filters.minAge = { $lte: Number(minAge) };
      if (maxAge) filters.maxAge = { $gte: Number(maxAge) };
    }

    // Available seats filter
    if (availableSeats === 'true') {
      filters.$expr = {
        $lt: [{ $size: '$participants' }, '$maxMembers'],
      };
    }

    const trips = await Trip.find(filters)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email profilePhoto fitnessLevel')
      .limit(50);

    // Calculate available seats for each trip
    const tripsWithSeats = trips.map((trip) => {
      const tripObj = trip.toObject();
      tripObj.availableSeats = Math.max(0, trip.maxMembers - trip.participants.length);
      return tripObj;
    });

    res.json({
      success: true,
      trips: tripsWithSeats,
      count: tripsWithSeats.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to search trips',
    });
  }
});

// GET /api/search/trekkers - Search trekkers with filters
router.get('/trekkers', protect, async (req, res) => {
  try {
    const {
      query,
      city,
      state,
      location,
      minTreks,
      maxTreks,
      experienceLevel,
      fitnessLevel,
      preferredDifficulty,
      minAge,
      maxAge,
      gender,
      minRating,
      verified,
      mutualFollowers,
    } = req.query;

    const filters = {};

    // Exclude current user
    filters._id = { $ne: req.user._id };

    // Text search on name and email
    if (query) {
      filters.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    // Location filter
    if (city || state || location) {
      const locationQuery = city || state || location || '';
      filters.location = { $regex: locationQuery, $options: 'i' };
    }

    // Age range
    if (minAge || maxAge) {
      filters.age = {};
      if (minAge) filters.age.$gte = Number(minAge);
      if (maxAge) filters.age.$lte = Number(maxAge);
    }

    // Gender filter
    if (gender) {
      filters.gender = gender;
    }

    // Fitness level
    if (fitnessLevel) {
      filters.fitnessLevel = fitnessLevel;
    }

    // Verified profile (placeholder - you can add a verified field to User model later)
    if (verified === 'true') {
      // For now, we'll filter by users with profile photos as a proxy
      filters.profilePhoto = { $ne: '' };
    }

    const users = await User.find(filters)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .limit(50);

    // Calculate treks completed for each user
    const usersWithTreks = await Promise.all(
      users.map(async (user) => {
        const treksCount = await Trip.countDocuments({ createdBy: user._id });
        const userObj = user.toObject();
        userObj.treksCompleted = treksCount;

        // Calculate experience level based on treks
        if (treksCount <= 1) {
          userObj.experienceLevel = 'Beginner';
        } else if (treksCount <= 5) {
          userObj.experienceLevel = 'Explorer';
        } else {
          userObj.experienceLevel = 'Pro';
        }

        return userObj;
      })
    );

    // Filter by treks completed
    let filteredUsers = usersWithTreks;
    if (minTreks) {
      filteredUsers = filteredUsers.filter((u) => u.treksCompleted >= Number(minTreks));
    }
    if (maxTreks) {
      filteredUsers = filteredUsers.filter((u) => u.treksCompleted <= Number(maxTreks));
    }

    // Filter by experience level
    if (experienceLevel) {
      filteredUsers = filteredUsers.filter((u) => u.experienceLevel === experienceLevel);
    }

    res.json({
      success: true,
      trekkers: filteredUsers,
      count: filteredUsers.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to search trekkers',
    });
  }
});

// GET /api/search/smart-match - Smart matching suggestions
router.get('/smart-match', protect, async (req, res) => {
  try {
    const user = req.user;

    // Get user's upcoming trips to find matching destinations
    const userTrips = await Trip.find({
      createdBy: user._id,
      startDate: { $gte: new Date() },
    })
      .sort({ startDate: 1 })
      .limit(5);

    const suggestions = [];

    // 1. Find users planning trips to same destinations
    if (userTrips.length > 0) {
      const destinations = userTrips.map((t) => t.destination);
      const matchingTrips = await Trip.find({
        destination: { $in: destinations },
        createdBy: { $ne: user._id },
        startDate: { $gte: new Date() },
        status: 'published',
      })
        .populate('createdBy', 'name email profilePhoto fitnessLevel age location')
        .limit(10);

      if (matchingTrips.length > 0) {
        suggestions.push({
          type: 'destination',
          title: `${matchingTrips.length} trekkers planning trips to your destinations`,
          trips: matchingTrips,
        });
      }
    }

    // 2. Find users with similar experience level
    const userTreksCount = await Trip.countDocuments({ createdBy: user._id });
    let userExpLevel = 'Beginner';
    if (userTreksCount > 5) userExpLevel = 'Pro';
    else if (userTreksCount > 1) userExpLevel = 'Explorer';

    const similarUsers = await User.find({
      _id: { $ne: user._id },
      fitnessLevel: user.fitnessLevel || { $exists: true },
    })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .limit(10);

    const similarUsersWithTreks = await Promise.all(
      similarUsers.map(async (u) => {
        const treksCount = await Trip.countDocuments({ createdBy: u._id });
        const uObj = u.toObject();
        uObj.treksCompleted = treksCount;
        return uObj;
      })
    );

    if (similarUsersWithTreks.length > 0) {
      suggestions.push({
        type: 'experience',
        title: `${similarUsersWithTreks.length} trekkers with similar experience`,
        users: similarUsersWithTreks,
      });
    }

    // 3. Find trips matching user's preferences
    const matchingTrips = await Trip.find({
      createdBy: { $ne: user._id },
      startDate: { $gte: new Date() },
      status: 'published',
      ...(user.fitnessLevel && { requiredFitness: user.fitnessLevel }),
      ...(user.age && {
        $or: [
          { minAge: { $lte: user.age } },
          { maxAge: { $gte: user.age } },
          { minAge: { $exists: false }, maxAge: { $exists: false } },
        ],
      }),
    })
      .populate('createdBy', 'name email profilePhoto fitnessLevel')
      .limit(10);

    if (matchingTrips.length > 0) {
      suggestions.push({
        type: 'preferences',
        title: `${matchingTrips.length} trips matching your profile`,
        trips: matchingTrips,
      });
    }

    res.json({
      success: true,
      suggestions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to get smart matches',
    });
  }
});

export default router;
