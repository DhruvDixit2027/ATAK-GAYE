require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');   // 👈 yahan change kiya

const matchRoutes = require('./src/routes/matchRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const userRoutes = require('./src/routes/userRoutes');
const helperRoutes = require('./src/routes/helperRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
connectDB();   // 👈 ab sahi call hoga

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Atak Gaye backend chal raha hai 🚀' });
});

// Routes
app.use('/api', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
