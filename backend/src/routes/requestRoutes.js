const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { emitRequestStatus } = require('../../sockets'); // 👈 NAYA: real-time status update ke liye

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
    emitRequestStatus(req.params.requestId, 'accepted'); // 👈 NAYA: customer ki tracking screen turant "Helper aa raha hai" pe switch hogi
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
    emitRequestStatus(req.params.requestId, 'rejected'); // 👈 NAYA: customer ko turant pata chalega, alternate helper dhoondne ke liye
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
      amount,
      paymentId,
      orderId,
      paymentStatus,
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
      amount,
      paymentId,
      orderId,
      paymentStatus,
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
    const request = await Request.findById(req.params.requestId)
      .populate('helperId', 'name phone vehicleType vehicleNumber rating');
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
// Helper ye call karta hai jab customer se OTP lekar submit kare — job complete
router.post('/:requestId/complete', async (req, res) => {
  try {
    const { otp } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.otp !== otp) {
      return res.status(400).json({ error: 'OTP galat hai' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    emitRequestStatus(req.params.requestId, 'completed'); // customer ko turant pata chal jaayega

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;