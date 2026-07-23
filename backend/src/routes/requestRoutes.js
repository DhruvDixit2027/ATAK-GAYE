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

module.exports = router;