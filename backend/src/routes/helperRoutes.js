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

// GET /api/helpers/by-phone/:phone — Helper Login ke liye:
// check karta hai ki is phone se koi helper pehle se registered hai ya nahi
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const helper = await Helper.findOne({ phone: req.params.phone });
    if (!helper) {
      return res.status(404).json({ error: 'Is phone se koi helper registered nahi hai' });
    }
    res.json(helper);
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

// PATCH /api/helpers/:helperId/location — helper apni live location update karega
router.patch('/:helperId/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ error: 'lat aur lng dono zaroori hain' });
    }

    const updated = await Helper.findByIdAndUpdate(
      req.params.helperId,
      { currentLocation: { lat, lng } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Helper nahi mila' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/helpers/:helperId — ek helper ki current details/location fetch karne ke liye
router.get('/:helperId', async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.helperId);
    if (!helper) return res.status(404).json({ error: 'Helper nahi mila' });
    res.json(helper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;