// Har helper ka raw data. Required skill match issue-type ke basis pe check hota hai.
export const HELPER_POOL = {
  petrol: [
    { name: "Ravi Kumar", init: "RK", vehicle: "Bajaj Pulsar · MP09 XX 4521", distanceKm: 1.2, rating: 4.8, availability: 0.95, skillMatch: 0.97, successRate: 0.94 },
    { name: "Sanjay Yadav", init: "SY", vehicle: "Hero Splendor · UP32 AB 7710", distanceKm: 2.6, rating: 4.5, availability: 0.7, skillMatch: 0.9, successRate: 0.88 },
    { name: "Imran Ali", init: "IA", vehicle: "TVS Star City · UP32 CD 1189", distanceKm: 0.8, rating: 4.2, availability: 0.6, skillMatch: 0.85, successRate: 0.8 },
    { name: "Deepak Singh", init: "DS", vehicle: "Bajaj CT100 · UP32 XY 4402", distanceKm: 3.4, rating: 4.9, availability: 0.5, skillMatch: 0.92, successRate: 0.9 },
  ],
  mechanic: [
    { name: "Mohd. Farhan", init: "MF", vehicle: "Mobile Workshop Van · UP32 MT 2210", distanceKm: 2.1, rating: 4.9, availability: 0.9, skillMatch: 0.98, successRate: 0.96 },
    { name: "Ajay Verma", init: "AV", vehicle: "Bike + Toolkit · UP32 QW 3345", distanceKm: 1.0, rating: 4.3, availability: 0.85, skillMatch: 0.8, successRate: 0.82 },
    { name: "Ramesh Chaurasia", init: "RC", vehicle: "Bike + Toolkit · UP32 ZP 9981", distanceKm: 4.0, rating: 4.7, availability: 0.65, skillMatch: 0.9, successRate: 0.89 },
    { name: "Suresh Pal", init: "SP", vehicle: "Car Mechanic Van · UP32 TT 5567", distanceKm: 1.8, rating: 4.0, availability: 0.55, skillMatch: 0.7, successRate: 0.75 },
  ],
  tyre: [
    { name: "Naveen Tiwari", init: "NT", vehicle: "Puncture Kit Bike · UP32 PR 1123", distanceKm: 1.5, rating: 4.6, availability: 0.92, skillMatch: 0.95, successRate: 0.93 },
    { name: "Vikas Gupta", init: "VG", vehicle: "Puncture Kit Bike · UP32 LK 7788", distanceKm: 0.9, rating: 4.1, availability: 0.6, skillMatch: 0.88, successRate: 0.85 },
    { name: "Salman Khan", init: "SK", vehicle: "Puncture Kit Bike · UP32 HD 4456", distanceKm: 2.9, rating: 4.8, availability: 0.7, skillMatch: 0.9, successRate: 0.91 },
  ],
  battery: [
    { name: "Anil Kashyap", init: "AK", vehicle: "Jump-start Van · UP32 BT 6620", distanceKm: 2.0, rating: 4.7, availability: 0.88, skillMatch: 0.96, successRate: 0.93 },
    { name: "Rakesh Mishra", init: "RM", vehicle: "Jump-start Bike · UP32 BT 3312", distanceKm: 1.1, rating: 4.2, availability: 0.65, skillMatch: 0.8, successRate: 0.8 },
    { name: "Gaurav Shukla", init: "GS", vehicle: "Jump-start Van · UP32 BT 9944", distanceKm: 3.6, rating: 4.9, availability: 0.5, skillMatch: 0.9, successRate: 0.9 },
  ],
  tow: [
    { name: "Manoj Rawat", init: "MR", vehicle: "Tow Truck · UP32 TW 1010", distanceKm: 3.2, rating: 4.8, availability: 0.8, skillMatch: 0.97, successRate: 0.95 },
    { name: "Harish Bhatt", init: "HB", vehicle: "Tow Truck · UP32 TW 2020", distanceKm: 5.5, rating: 4.4, availability: 0.6, skillMatch: 0.85, successRate: 0.83 },
    { name: "Yogesh Rana", init: "YR", vehicle: "Tow Truck · UP32 TW 3030", distanceKm: 1.9, rating: 4.0, availability: 0.4, skillMatch: 0.75, successRate: 0.7 },
  ],
};

// AI scoring weights — inhe tune karke priorities badal sakte ho
export const WEIGHTS = { distance: 0.25, rating: 0.2, availability: 0.15, skill: 0.2, successRate: 0.2 };

export function scoreHelper(h) {
  // Distance: closer is better. Normalize against a 6km max radius.
  const distScore = Math.max(0, 1 - h.distanceKm / 6);
  const ratingScore = h.rating / 5;
  const availScore = h.availability;
  const skillScore = h.skillMatch;
  const successScore = h.successRate;

  const total =
    distScore * WEIGHTS.distance +
    ratingScore * WEIGHTS.rating +
    availScore * WEIGHTS.availability +
    skillScore * WEIGHTS.skill +
    successScore * WEIGHTS.successRate;

  // ETA estimate: base speed ~20km/h in mixed traffic, plus small buffer
  const etaMin = Math.max(2, Math.round((h.distanceKm / 20) * 60 + (1 - availScore) * 3));

  return {
    ...h,
    distScore,
    ratingScore,
    availScore,
    skillScore,
    successScore,
    matchPercent: Math.round(total * 100),
    etaMin,
  };
}

export function getRankedCandidates(issueType) {
  const pool = HELPER_POOL[issueType] || HELPER_POOL.mechanic;
  return pool.map(scoreHelper).sort((a, b) => b.matchPercent - a.matchPercent);
}

export const ISSUES = [
  { id: "petrol", emoji: "⛽", name: "Petrol / Diesel khatam", sub: "5 litre tak delivery", price: "₹80 + fuel" },
  { id: "mechanic", emoji: "🔧", name: "Bike/Car kharab", sub: "On-spot mechanic check-up", price: "₹120" },
  { id: "tyre", emoji: "🛞", name: "Puncture / Flat tyre", sub: "Repair ya spare fitting", price: "₹100" },
  { id: "battery", emoji: "🔋", name: "Battery down / Jump start", sub: "2 min mein jump start", price: "₹90" },
  { id: "tow", emoji: "🚛", name: "Towing chahiye", sub: "Nearest garage tak le jayenge", price: "₹8/km" },
];
