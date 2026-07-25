require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');
const helperRoutes = require('./routes/helperRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware - runs on every request
app.use(cors());              // allows your frontend to call this backend
app.use(express.json({ limit: '10mb' }));     // lets us read JSON sent from the frontend

// Uploaded images ko serve karne ke liye (e.g. /uploads/12345.jpg)
// __dirname use kiya taaki ye hamesha server.js ke saath waale
// "uploads" folder ko point kare, chahe terminal kahin se bhi chalao
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
connectDB();

// Health check - visit this in browser to confirm server is alive
app.get('/', (req, res) => {
  res.json({ message: 'Atak Gaye backend chal raha hai 🚀' });
});

// Mount our routes under /api
app.use('/api', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});