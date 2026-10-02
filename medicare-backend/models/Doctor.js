const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      trim: true
    },
    // Simple weekly availability, e.g. [{ day: "Monday", startTime: "09:00", endTime: "13:00" }]
    availability: [
      {
        day: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ]
        },
        startTime: String,
        endTime: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
