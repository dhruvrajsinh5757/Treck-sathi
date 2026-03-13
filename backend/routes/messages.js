import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function conversationIdFor(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `${x}:${y}`;
}

// GET /api/messages/conversations - list conversations for current user
router.get('/messages/conversations', protect, async (req, res) => {
  try {
    const uid = req.user._id;

    const conv = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: uid }, { receiverId: uid }],
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastTimestamp: { $first: '$timestamp' },
          lastSenderId: { $first: '$senderId' },
          lastReceiverId: { $first: '$receiverId' },
        },
      },
      { $sort: { lastTimestamp: -1 } },
      { $limit: 50 },
    ]);

    const otherUserIds = conv
      .map((c) => (String(c.lastSenderId) === String(uid) ? c.lastReceiverId : c.lastSenderId))
      .filter(Boolean);

    const users = await User.find({ _id: { $in: otherUserIds } }).select('name profilePhoto location');
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const conversations = conv.map((c) => {
      const otherId = String(c.lastSenderId) === String(uid) ? c.lastReceiverId : c.lastSenderId;
      const other = userMap.get(String(otherId));
      return {
        conversationId: c._id,
        otherUser: other
          ? { _id: other._id, name: other.name, profilePhoto: other.profilePhoto, location: other.location }
          : { _id: otherId, name: 'User', profilePhoto: '' },
        lastMessage: c.lastMessage,
        lastTimestamp: c.lastTimestamp,
      };
    });

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load conversations' });
  }
});

// GET /api/messages/:userId - get chat history with a user
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const uid = req.user._id;
    const cid = conversationIdFor(uid, userId);

    const messages = await Message.find({ conversationId: cid })
      .sort({ timestamp: 1 })
      .limit(500)
      .select('senderId receiverId message timestamp readStatus');

    res.json({ success: true, conversationId: cid, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load messages' });
  }
});

// POST /api/messages/:userId - send message to user
router.post('/messages/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    const receiver = await User.findById(userId).select('_id');
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

    const cid = conversationIdFor(req.user._id, receiver._id);
    const msg = await Message.create({
      conversationId: cid,
      senderId: req.user._id,
      receiverId: receiver._id,
      message: String(message).trim(),
      timestamp: new Date(),
      readStatus: 'sent',
    });

    await Notification.create({
      userId: receiver._id,
      actorId: req.user._id,
      type: 'message',
      message: `${req.user.name || 'Someone'} sent you a message`,
    });

    res.status(201).json({ success: true, message: 'Message sent', data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to send message' });
  }
});

export { conversationIdFor };
export default router;

