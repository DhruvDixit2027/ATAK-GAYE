require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const matchRoutes = require('./src/routes/matchRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const userRoutes = require('./src/routes/userRoutes');
const helperRoutes = require('./src/routes/helperRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { initSocket } = require('./sockets');

const app = express();
const httpServer = http.createServer(app); // 👈 NAYA: express ko http server ke andar wrap kiya, taaki socket.io usi port pe chal sake

// Middleware - runs on every request
app.use(cors());              // allows your frontend to call this backend
app.use(express.json({ limit: '10mb' }));     // lets us read JSON sent from the frontend

// Uploaded images ko serve karne ke liye (e.g. /uploads/12345.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
connectDB();

// 👇 NAYA: Socket.IO setup — dono (user app + helper app) isi se connect honge
const io = new Server(httpServer, {
  cors: { origin: '*' }, // koi bhi origin se connect ho sakta hai (app ke liye zaroori)
});
initSocket(io);

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
httpServer.listen(PORT, () => { // 👈 NAYA: app.listen ki jagah httpServer.listen (socket.io ke liye zaroori)
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});