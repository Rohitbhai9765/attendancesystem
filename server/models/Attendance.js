const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String, // Stored as 'YYYY-MM-DD'
    required: true,
    unique: true
  },
  presentStudents: [{
    type: String // We will store the MIS strings here
  }],
  lectureConducted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
