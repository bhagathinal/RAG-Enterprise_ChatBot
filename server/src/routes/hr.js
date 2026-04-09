const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

const router = express.Router();

/**
 * @route   GET /api/hr/stats
 * @desc    Get logged-in user HR metrics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('leavesRemaining tenure attendanceRate pendingApprovals jobTitle profileCompletion joinedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/hr/announcements
 * @desc    Get latest company announcements
 * @access  Private
 */
router.get('/announcements', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true })
      .sort({ date: -1 })
      .limit(5);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
