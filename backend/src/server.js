require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');

const app = express();

// Middleware - runs on every request
app.use(cors());              // allows your frontend to call this backend
app.use(express.json());     // lets us read JSON sent from the frontend

// Connect to database
connectDB();

// Health check - visit this in browser to confirm server is alive
app.get('/', (req, res) => {
  res.json({ message: 'Atak Gaye backend chal raha hai 🚀' });
});

// Mount our routes under /api
app.use('/api', matchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
