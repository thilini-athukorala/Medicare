const Doctor = require('../models/Doctor');

// @route   GET /api/doctors
// @desc    Get all doctors (optionally filter by specialty via ?specialty=)
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.specialty) {
      filter.specialty = new RegExp(req.query.specialty, 'i');
    }

    const doctors = await Doctor.find(filter).populate('user', 'name email phone');
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/doctors/:id
// @desc    Get a single doctor's full profile
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/doctors/me
// @desc    Update the logged-in doctor's own profile (specialty, fee, availability, etc.)
// @access  Private (DOCTOR only)
const updateMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const fields = ['specialty', 'qualification', 'experienceYears', 'consultationFee', 'bio', 'availability'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    const updated = await doctor.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getDoctors, getDoctorById, updateMyDoctorProfile };
