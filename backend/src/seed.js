require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Helper = require('./models/Helper');
const User = require('./models/User');
const Request = require('./models/Request');

async function seed() {
  await connectDB();

  // Clear existing data
  await Helper.deleteMany({});
  await User.deleteMany({});
  await Request.deleteMany({});

  // ---- Helpers ----
const helpers = await Helper.insertMany([
  { name: "Ravi Kumar", phone: "9001100001", vehicleType: "Bajaj Pulsar", vehicleNumber: "MP09 XX 4521", currentLocation: { lat: 26.8500, lng: 80.9450 }, skillTypes: ["petrol"], rating: 4.8, availability: true, successRate: 0.94 },
  { name: "Sanjay Yadav", phone: "9001100002", vehicleType: "Hero Splendor", vehicleNumber: "UP32 AB 7710", currentLocation: { lat: 26.8620, lng: 80.9600 }, skillTypes: ["petrol"], rating: 4.5, availability: true, successRate: 0.88 },
  { name: "Mohd. Farhan", phone: "9001100003", vehicleType: "Mobile Workshop Van", vehicleNumber: "UP32 MT 2210", currentLocation: { lat: 26.8480, lng: 80.9500 }, skillTypes: ["mechanic"], rating: 4.9, availability: true, successRate: 0.96 },
  { name: "Ajay Verma", phone: "9001100004", vehicleType: "Bike + Toolkit", vehicleNumber: "UP32 QW 3345", currentLocation: { lat: 26.8455, lng: 80.9470 }, skillTypes: ["mechanic"], rating: 4.3, availability: true, successRate: 0.82 },
  { name: "Naveen Tiwari", phone: "9001100005", vehicleType: "Puncture Kit Bike", vehicleNumber: "UP32 PR 1123", currentLocation: { lat: 26.8490, lng: 80.9440 }, skillTypes: ["tyre"], rating: 4.6, availability: true, successRate: 0.93 },
  { name: "Vikas Gupta", phone: "9001100006", vehicleType: "Puncture Kit Bike", vehicleNumber: "UP32 LK 7788", currentLocation: { lat: 26.8475, lng: 80.9455 }, skillTypes: ["tyre"], rating: 4.1, availability: true, successRate: 0.85 },
  { name: "Anil Kashyap", phone: "9001100007", vehicleType: "Jump-start Van", vehicleNumber: "UP32 BT 6620", currentLocation: { lat: 26.8510, lng: 80.9480 }, skillTypes: ["battery"], rating: 4.7, availability: true, successRate: 0.93 },
  { name: "Rakesh Mishra", phone: "9001100008", vehicleType: "Jump-start Bike", vehicleNumber: "UP32 BT 3312", currentLocation: { lat: 26.8465, lng: 80.9445 }, skillTypes: ["battery"], rating: 4.2, availability: true, successRate: 0.80 },
  { name: "Manoj Rawat", phone: "9001100009", vehicleType: "Tow Truck", vehicleNumber: "UP32 TW 1010", currentLocation: { lat: 26.8550, lng: 80.9520 }, skillTypes: ["tow"], rating: 4.8, availability: true, successRate: 0.95 },
  { name: "Harish Bhatt", phone: "9001100010", vehicleType: "Tow Truck", vehicleNumber: "UP32 TW 2020", currentLocation: { lat: 26.8650, lng: 80.9650 }, skillTypes: ["tow"], rating: 4.4, availability: true, successRate: 0.83 },
]);

  // ---- Users ----
  const users = await User.insertMany([
    { name: "Rohit Sharma", phone: "9876500001", currentLocation: { lat: 26.8467, lng: 80.9462 } },
    { name: "Priya Singh", phone: "9876500002", currentLocation: { lat: 26.8500, lng: 80.9500 } },
    { name: "Amit Verma", phone: "9876500003", currentLocation: { lat: 26.8440, lng: 80.9420 } },
  ]);

  // ---- Requests (using real inserted IDs) ----
  await Request.insertMany([
    {
      userId: users[0]._id,
      issueType: "mechanic",
      status: "pending",
      helperId: null,
      userLocation: users[0].currentLocation,
      otp: "4471",
      createdAt: new Date("2026-07-22T10:15:00.000Z"),
    },
    {
      userId: users[1]._id,
      issueType: "petrol",
      status: "matched",
      helperId: helpers[0]._id,
      userLocation: users[1].currentLocation,
      otp: "9203",
      createdAt: new Date("2026-07-22T09:50:00.000Z"),
    },
    {
      userId: users[2]._id,
      issueType: "tow",
      status: "completed",
      helperId: helpers[8]._id,
      userLocation: users[2].currentLocation,
      otp: "5518",
      createdAt: new Date("2026-07-21T18:30:00.000Z"),
    },
  ]);

  console.log("✅ Seeded helpers, users, and requests successfully!");
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.connection.close();
});