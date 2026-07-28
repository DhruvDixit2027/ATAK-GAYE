const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Helper = require('../models/Helper');
const Request = require('../models/Request');

// POST /api/admin/login — simple password check (env variable se)
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Password galat hai' });
  }
});

// GET /api/admin/stats — dashboard ke top cards ke liye summary numbers
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHelpers = await Helper.countDocuments();
    const totalRequests = await Request.countDocuments();

    // Aaj ka start time nikaalo (midnight se)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRequests = await Request.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    // Sirf paid requests se earnings calculate karo
    const paidRequests = await Request.find({ paymentStatus: 'paid' });
    const totalEarnings = paidRequests.reduce((sum, r) => sum + (r.amount || 0), 0);

    const todayPaidRequests = paidRequests.filter(
      (r) => new Date(r.createdAt) >= startOfToday
    );
    const todayEarnings = todayPaidRequests.reduce((sum, r) => sum + (r.amount || 0), 0);

    res.json({
      totalUsers,
      totalHelpers,
      totalRequests,
      todayRequests,
      totalEarnings,
      todayEarnings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — sab users, sabse naye pehle
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/helpers — sab helpers, sabse naye pehle
router.get('/helpers', async (req, res) => {
  try {
    const helpers = await Helper.find().sort({ createdAt: -1 });
    res.json(helpers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/requests — sab requests, helper/user ki info ke saath
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('userId', 'name phone')
      .populate('helperId', 'name phone vehicleType')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;