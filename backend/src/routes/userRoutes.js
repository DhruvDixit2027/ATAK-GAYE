const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user, ya agar phone already exist karta hai to wahi purana user return karo
router.post('/create', async (req, res) => {
  try {
    const { name, phone, vehicleType, currentLocation } = req.body;

    if (!name || !phone || !currentLocation) {
      return res.status(400).json({ error: 'Naam, phone aur location zaroori hai' });
    }

    // Agar ye phone number pehle se registered hai, to naya user mat banao
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ name, phone, vehicleType, currentLocation });
      await user.save();
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;