const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @route   GET /api/stats
// @desc    Public platform stats shown on the home page
// @access  Public
const getStats = async (req, res) => {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: 'PATIENT' }),
      Appointment.countDocuments()
    ]);
    return res.json({ doctors, patients, appointments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
