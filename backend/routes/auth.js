import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname) || '.jpg');
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i.test(path.extname(file.originalname));
    if (allowed) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/signup
router.post('/signup', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, email, password, confirmPassword, fitnessLevel } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      fitnessLevel: fitnessLevel || '',
      profilePhoto,
    });

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { ...userObj, profilePhoto: user.profilePhoto },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

// GET /api/auth/me (protected)
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile (protected) - update profile fields + optional avatar upload
router.put('/profile', protect, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, age, gender, location, fitnessLevel, emergencyContact, bio } = req.body;

    const updates = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof fitnessLevel === 'string') updates.fitnessLevel = fitnessLevel;
    if (typeof gender === 'string') updates.gender = gender.trim();
    if (typeof location === 'string') updates.location = location.trim();
    if (typeof emergencyContact === 'string') updates.emergencyContact = emergencyContact.trim();
    if (typeof bio === 'string') updates.bio = bio.trim();
    if (age !== undefined && age !== null && age !== '') updates.age = Number(age);

    if (req.file) {
      updates.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Profile update failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetPasswordToken +resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }
    const plainToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${plainToken}`;
    // TODO: send email with resetUrl when email service is configured
    res.json({ success: true, message: 'Reset link generated', resetUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Request failed' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Token, new password and confirm password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpire');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password updated. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Reset failed' });
  }
});

export default router;
