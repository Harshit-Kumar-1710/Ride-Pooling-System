const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

const creditRoutes = require('./routes/creditRoutes');   
app.use('/api/credits', creditRoutes);                   

const rideRoutes    = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/rides',    rideRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Ridepooling API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));