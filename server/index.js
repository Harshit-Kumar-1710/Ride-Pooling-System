require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes    = require('./routes/authRoutes');
const creditRoutes  = require('./routes/creditRoutes');
const rideRoutes    = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');

const app    = express();
const server = http.createServer(app);

// Allow all origins dynamically to prevent Vercel CORS issues
const io = new Server(server, {
  cors: { origin: true, methods: ['GET', 'POST'], credentials: true }
});

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',     authRoutes);
app.use('/api/credits',  creditRoutes);
app.use('/api/rides',    rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews',  reviewRoutes);

app.get('/', (req, res) => res.json({ message: 'Ridepooling API is running' }));

// In-memory chat storage
const chatHistory = {};

// Socket.io — live tracking
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Driver joins a ride room
  socket.on('driver:join', ({ rideId, driverId }) => {
    socket.join(`ride:${rideId}`);
    console.log(`Driver ${driverId} joined ride room ${rideId}`);
  });

  // Passenger joins a ride room to watch
  socket.on('passenger:join', ({ rideId }) => {
    socket.join(`ride:${rideId}`);
    console.log(`Passenger joined ride room ${rideId}`);
  });

  // Driver sends location update
  socket.on('driver:location', ({ rideId, lat, lng }) => {
    socket.to(`ride:${rideId}`).emit('driver:location', { lat, lng });
  });

  // Driver starts the ride
  socket.on('ride:started', ({ rideId }) => {
    io.to(`ride:${rideId}`).emit('ride:started', { rideId });
  });

  // ── Ride Chat ──
  socket.on('chat:join', ({ rideId, userName }) => {
    socket.join(`chat:${rideId}`);
    // Send chat history for this ride
    socket.emit('chat:history', chatHistory[rideId] || []);
  });

  socket.on('chat:send', ({ rideId, senderId, senderName, text }) => {
    const msg = { senderId, senderName, text, timestamp: new Date().toISOString() };
    if (!chatHistory[rideId]) chatHistory[rideId] = [];
    chatHistory[rideId].push(msg);
    // Keep only last 100 messages per ride
    if (chatHistory[rideId].length > 100) chatHistory[rideId].shift();
    io.to(`chat:${rideId}`).emit('chat:message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));