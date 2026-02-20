import express from 'express';
import multer from 'multer';
import path from 'path';
import Trek from '../models/Trek.js';
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
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i.test(path.extname(file.originalname));
    if (allowed) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// GET /api/treks - current user's trek history
router.get('/treks', protect, async (req, res) => {
  try {
    const treks = await Trek.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, treks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to load treks' });
  }
});

// POST /api/treks - add completed trek (multipart)
router.post('/treks', protect, upload.array('photos', 6), async (req, res) => {
  try {
    const { name, location, difficulty, durationDays, year } = req.body;
    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Trek name and location are required' });
    }

    const photos = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const trek = await Trek.create({
      name: String(name).trim(),
      location: String(location).trim(),
      difficulty: difficulty || 'Easy',
      durationDays: durationDays ? Number(durationDays) : undefined,
      year: year ? Number(year) : undefined,
      photos,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Trek added', trek });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to add trek' });
  }
});

export default router;

