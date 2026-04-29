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

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',     authRoutes);
app.use('/api/credits',  creditRoutes);
app.use('/api/rides',    rideRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => res.json({ message: 'Ridepooling API is running' }));

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

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));