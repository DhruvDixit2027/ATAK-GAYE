const express = require('express');
const router = express.Router();
const Helper = require('../models/Helper');

// Create a new helper, ya agar phone already registered hai to wahi purana helper return karo
router.post('/create', async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber, skillTypes, currentLocation } = req.body;

    if (!name || !phone || !vehicleType || !vehicleNumber || !skillTypes || !currentLocation) {
      return res.status(400).json({ error: 'Sab fields zaroori hain: naam, phone, vehicle type, vehicle number, skill, location' });
    }

    let helper = await Helper.findOne({ phone });

    if (!helper) {
      helper = new Helper({
        name,
        phone,
        vehicleType,
        vehicleNumber,
        skillTypes,
        currentLocation,
      });
      await helper.save();
    }

    res.status(201).json(helper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper apni availability (online/offline) toggle kar sake
router.post('/:helperId/availability', async (req, res) => {
  try {
    const { availability } = req.body;
    const updated = await Helper.findByIdAndUpdate(
      req.params.helperId,
      { availability },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;