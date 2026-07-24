const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

router.get('/pending/:helperId', async (req, res) => {
  try {
    const requests = await Request.find({
      helperId: req.params.helperId,
      status: 'pending',
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:requestId/accept', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status: 'accepted' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:requestId/reject', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status: 'rejected' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new request (jab user AI matching ke baad "confirm" dabata hai)
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      helperId,
      issueType,
      userLocation,
      matchScore,
      matchBreakdown,
      estimatedArrivalMin,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId zaroori hai' });
    }

    const newRequest = new Request({
      userId,
      helperId,
      issueType,
      userLocation,
      status: 'pending',
      matchScore,
      matchBreakdown,
      estimatedArrivalMin,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Ek specific request ka current status check karne ke liye (tracking screen isko poll karegi)
router.get('/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/requests/user/:userId — us user ki saari requests (history ke liye)
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.userId })
      .populate('helperId', 'name vehicleType vehicleNumber rating')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;