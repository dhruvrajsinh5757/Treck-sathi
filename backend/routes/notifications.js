import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - list notifications for current user
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actorId', 'name profilePhoto');

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load notifications' });
  }
});

// POST /api/notifications/read-all - mark all as read
router.post('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to mark notifications read' });
  }
});

export default router;

