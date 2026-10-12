const mongoose = require('mongoose');

// A doctor profile. The login account (User with role DOCTOR) is created by an ADMIN.
const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true
    },
    hospital: { type: String, trim: true },
    qualification: { type: String, trim: true },
    experienceYears: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    bio: { type: String, trim: true },

    // Length of each appointment in minutes
    slotMinutes: { type: Number, default: 30 },

    // Dates the doctor is available, e.g. { date: '2026-10-20', startTime: '09:00', endTime: '13:00' }
    availability: [
      {
        _id: false,
        date: { type: String, required: true }, // YYYY-MM-DD
        startTime: { type: String, required: true }, // HH:MM
        endTime: { type: String, required: true } // HH:MM
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
