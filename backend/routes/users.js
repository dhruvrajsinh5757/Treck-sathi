import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function cleanObjectIdArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => mongoose.isValidObjectId(v));
}

function getExperienceLevelFromTreks(treksCompleted) {
  if (!treksCompleted || treksCompleted <= 1) return 'Beginner';
  if (treksCompleted <= 5) return 'Explorer';
  return 'Pro';
}

// GET /api/users/:id - public profile (protected)
router.get('/users/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const treksCompleted = await Trip.countDocuments({
      participants: user._id,
      status: 'published',
    });

    const experienceLevel = getExperienceLevelFromTreks(treksCompleted);

    const isFollowing = Array.isArray(req.user.following)
      ? req.user.following.some((uid) => uid.toString() === user._id.toString())
      : false;

    // Trek history: last 12 published trips user participated in
    const trekHistoryTrips = await Trip.find({
      participants: user._id,
      status: 'published',
    })
      .sort({ endDate: -1, createdAt: -1 })
      .limit(12)
      .select('title destination difficulty endDate coverImage tripType');

    const trekHistory = trekHistoryTrips.map((t) => ({
      _id: t._id,
      name: t.title,
      location: t.destination,
      difficulty: t.difficulty,
      year: t.endDate ? new Date(t.endDate).getFullYear() : null,
      photo: t.coverImage,
      tripType: t.tripType,
    }));

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        age: user.age,
        gender: user.gender,
        location: user.location,
        bio: user.bio,
        fitnessLevel: user.fitnessLevel,
        followersCount: user.followersCount ?? (user.followers?.length || 0),
        followingCount: user.followingCount ?? (user.following?.length || 0),
        treksCompleted,
        experienceLevel,
      },
      isFollowing,
      trekHistory,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load profile' });
  }
});

// POST /api/users/:id/follow
router.post('/users/:id/follow', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const target = await User.findById(id);
    const me = await User.findById(req.user._id);
    if (!target || !me) return res.status(404).json({ success: false, message: 'User not found' });

    // Clean any legacy invalid data (numbers/strings) so validation doesn't fail
    me.following = cleanObjectIdArray(me.following);
    target.followers = cleanObjectIdArray(target.followers);

    const alreadyFollowing = me.following.some((uid) => uid.toString() === target._id.toString());
    if (alreadyFollowing) {
      return res.json({
        success: true,
        message: 'Already following',
        followersCount: target.followers.length,
      });
    }

    me.following.push(target._id);
    target.followers.push(me._id);

    await Promise.all([
      me.save(),
      target.save(),
      Notification.create({
        userId: target._id,
        actorId: req.user._id,
        type: 'follow',
        message: `${req.user.name || 'Someone'} started following you`,
      }),
    ]);

    const updatedTarget = await User.findById(target._id);
    res.json({
      success: true,
      message: 'Followed',
      followersCount: updatedTarget?.followers?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to follow user' });
  }
});

// POST /api/users/:id/unfollow
router.post('/users/:id/unfollow', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot unfollow yourself' });
    }

    const target = await User.findById(id);
    const me = await User.findById(req.user._id);
    if (!target || !me) return res.status(404).json({ success: false, message: 'User not found' });

    // Clean any legacy invalid data (numbers/strings) so validation doesn't fail
    me.following = cleanObjectIdArray(me.following);
    target.followers = cleanObjectIdArray(target.followers);

    me.following = me.following.filter((uid) => uid.toString() !== target._id.toString());
    target.followers = target.followers.filter((uid) => uid.toString() !== me._id.toString());

    await Promise.all([me.save(), target.save()]);

    const updatedTarget = await User.findById(target._id);
    res.json({
      success: true,
      message: 'Unfollowed',
      followersCount: updatedTarget?.followers?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to unfollow user' });
  }
});

// GET /api/users/following - list users current user is following
router.get('/users/following', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate('following', 'name profilePhoto location fitnessLevel');
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const following =
      Array.isArray(me.following) && me.following.length
        ? me.following.map((u) => ({
            _id: u._id,
            name: u.name,
            profilePhoto: u.profilePhoto,
            location: u.location,
            fitnessLevel: u.fitnessLevel,
          }))
        : [];

    res.json({ success: true, following });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load following list' });
  }
});

export default router;

