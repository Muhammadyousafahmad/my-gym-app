const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();

// CORS Settings
app.use(cors({
  origin: '*', // Allow all for demo environment, can narrow for prod
  credentials: true
}));

// Route for Stripe Webhook requires RAW body, so we hook it BEFORE express.json middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const trainerRoutes = require('./routes/trainers');
const classRoutes = require('./routes/classes');
const workoutRoutes = require('./routes/workoutPlans');
const dietRoutes = require('./routes/dietPlans');
const attendanceRoutes = require('./routes/attendance');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/workout-plans', workoutRoutes);
app.use('/api/diet-plans', dietRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all response
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Gym/Fitness Management System API!' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gym-app';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB database connected successfully!');
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error('Database connection error: ', err.message);
  });
