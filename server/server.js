require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Attendance = require('./models/Attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-system';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// 1. Get all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find();
    // Transform DB array into the key-value map the frontend expects
    const attendanceMap = {};
    records.forEach(record => {
      attendanceMap[record.date] = {
        presentStudents: record.presentStudents,
        lectureConducted: record.lectureConducted ?? false
      };
    });
    res.json(attendanceMap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// 2. Save or update attendance for a specific date
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, presentStudents, lectureConducted = false } = req.body;
    
    // Upsert: Create if it doesn't exist, update if it does
    await Attendance.findOneAndUpdate(
      { date },
      { presentStudents, lectureConducted },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// 3. Admin Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-token-123' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
