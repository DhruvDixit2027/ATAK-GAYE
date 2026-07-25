const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../config/upload');

// Create a new user, ya agar phone already exist karta hai to wahi purana user return karo
router.post('/create', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, phone, vehicleType } = req.body;
    const currentLocation = req.body.currentLocation
      ? JSON.parse(req.body.currentLocation)
      : null;

    if (!name || !phone || !currentLocation) {
      return res.status(400).json({ error: 'Naam, phone aur location zaroori hai' });
    }

    // Agar ye phone number pehle se registered hai, to naya user mat banao
    let user = await User.findOne({ phone });

    if (!user) {
      const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;
      user = new User({ name, phone, vehicleType, currentLocation, profilePhoto });
      await user.save();
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:userId — profile edit karne ke liye
router.patch('/:userId', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, phone, vehicleType } = req.body;
    const currentLocation = req.body.currentLocation
      ? JSON.parse(req.body.currentLocation)
      : undefined;

    const updateData = { name, phone, vehicleType };
    if (currentLocation) updateData.currentLocation = currentLocation;

    // Nayi photo upload hui hai to path update karo, warna purani wahi rehne do
    if (req.file) {
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User nahi mila' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;