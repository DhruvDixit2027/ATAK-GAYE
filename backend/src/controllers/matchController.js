const { findBestMatches } = require('../services/matchingService');

// This function runs when someone hits POST /api/match
async function getMatches(req, res) {
  try {
    const { lat, lng, serviceType } = req.body;

    // Basic validation - beginner-friendly, checks everything is present
    if (!lat || !lng || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'lat, lng, and serviceType are required'
      });
    }

    const matches = await findBestMatches(lat, lng, serviceType);

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Koi helper available nahi hai abhi'
      });
    }

    res.status(200).json({
      success: true,
      count: matches.length,
      bestMatch: matches[0],
      allMatches: matches
    });

  } catch (error) {
    console.error('Error in getMatches:', error.message);
    res.status(500).json({ success: false, message: 'Server error, try again' });
  }
}

module.exports = { getMatches };
