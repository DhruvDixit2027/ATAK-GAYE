const Helper = require('../models/Helper');

// Calculates distance in km between two lat/lng points (Haversine formula)
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Converts distance into a 0-100 score (closer = higher score)
function distanceScore(km) {
  if (km <= 1) return 100;
  if (km >= 10) return 0;
  return 100 - (km - 1) * (100 / 9);
}

// Checks how many of the required skills this helper has, as a %
function skillMatchScore(helperSkills, requiredSkill) {
  return helperSkills.includes(requiredSkill) ? 100 : 40;
}

// Main function: takes user's location + what they need, returns ranked helpers
async function findBestMatches(userLat, userLng, requiredSkill) {
  const helpers = await Helper.find({ isAvailable: true, skills: { $in: [requiredSkill] } });

  const scored = helpers.map(helper => {
    const distanceKm = getDistanceKm(userLat, userLng, helper.location.lat, helper.location.lng);

    const dScore = distanceScore(distanceKm);
    const rScore = (helper.rating / 5) * 100;
    const sScore = skillMatchScore(helper.skills, requiredSkill);
    const successScore = helper.successRate;
    const availScore = helper.isAvailable ? 95 : 0;

    // Weighted final score — adjust these weights anytime to tune matching
    const finalScore =
      dScore * 0.35 +
      rScore * 0.25 +
      sScore * 0.15 +
      successScore * 0.15 +
      availScore * 0.10;

    return {
      id: helper._id,
      name: helper.name,
      vehicle: helper.vehicle,
      plateNumber: helper.plateNumber,
      distanceKm: Number(distanceKm.toFixed(1)),
      rating: helper.rating,
      successRate: helper.successRate,
      skillMatch: sScore,
      availability: availScore,
      matchPercent: Math.round(finalScore)
    };
  });

  // Highest score first
  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  return scored;
}

module.exports = { findBestMatches, getDistanceKm };
