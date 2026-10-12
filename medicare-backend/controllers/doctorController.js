const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { slotsForDate, toMinutes } = require('../utils/slots');

const FIELDS = ['name', 'specialty', 'hospital', 'qualification', 'experienceYears', 'consultationFee', 'bio'];

const pickFields = (body) => {
  const data = {};
  FIELDS.forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  return data;
};

// @route   GET /api/doctors
// @desc    List doctors (optional ?specialty= filter)
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.specialty) {
      filter.specialty = new RegExp(req.query.specialty, 'i');
    }
    const doctors = await Doctor.find(filter).select('-user').sort({ name: 1 });
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/doctors/admin/list
// @desc    Doctors with their login email (for the admin screen)
// @access  Private (ADMIN)
const getDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'email').sort({ name: 1 });
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/doctors/me
// @desc    The logged-in doctor's own profile
// @access  Private (DOCTOR)
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).select('-user');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/doctors/me/availability
// @desc    Doctor updates the dates/times they are available
// @access  Private (DOCTOR)
const updateMyAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const { availability, slotMinutes } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'availability must be a list' });
    }

    const minutes = Number(slotMinutes) || doctor.slotMinutes || 30;
    if (minutes < 10 || minutes > 120) {
      return res.status(400).json({ message: 'Slot length must be between 10 and 120 minutes' });
    }

    const byDate = new Map(); // one entry per date, last one wins
    for (const a of availability) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date || '')) {
        return res.status(400).json({ message: 'Each date must look like YYYY-MM-DD' });
      }
      if (!/^\d{2}:\d{2}$/.test(a.startTime || '') || !/^\d{2}:\d{2}$/.test(a.endTime || '')) {
        return res.status(400).json({ message: 'Times must look like HH:MM' });
      }
      if (toMinutes(a.startTime) + minutes > toMinutes(a.endTime)) {
        return res.status(400).json({ message: `On ${a.date}, the end time must leave room for at least one slot` });
      }
      byDate.set(a.date, { date: a.date, startTime: a.startTime, endTime: a.endTime });
    }

    doctor.availability = [...byDate.values()].sort((x, y) => x.date.localeCompare(y.date));
    doctor.slotMinutes = minutes;
    await doctor.save();
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-user');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @desc    Free (not yet booked) slots for one date
// @access  Public
const getDoctorSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
      return res.status(400).json({ message: 'date must look like YYYY-MM-DD' });
    }
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const all = slotsForDate(doctor, date);
    const booked = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: new Date(date),
      status: { $in: ['PENDING', 'CONFIRMED'] }
    }).select('timeSlot');
    const bookedSet = new Set(booked.map((b) => b.timeSlot));

    return res.json({ date, slots: all.filter((s) => !bookedSet.has(s)) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/doctors
// @desc    Admin adds a doctor AND creates the doctor's login account
// @access  Private (ADMIN)
const createDoctor = async (req, res) => {
  let user;
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required for the doctor login' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    user = await User.create({ name, email, password, role: 'DOCTOR' });
    const doctor = await Doctor.create({ user: user._id, ...pickFields(req.body) });
    return res.status(201).json(doctor);
  } catch (error) {
    if (user) await user.deleteOne(); // roll back the login if the profile failed
    return res.status(400).json({ message: error.message });
  }
};

// @route   PUT /api/doctors/:id
// @desc    Admin edits a doctor (profile, and optionally login email / new password)
// @access  Private (ADMIN)
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    Object.assign(doctor, pickFields(req.body));
    await doctor.save();

    const { email, password } = req.body;
    const user = doctor.user ? await User.findById(doctor.user).select('+password') : null;
    if (user) {
      user.name = doctor.name;
      if (email && email !== user.email) {
        if (await User.findOne({ email, _id: { $ne: user._id } })) {
          return res.status(400).json({ message: 'A user with this email already exists' });
        }
        user.email = email;
      }
      if (password) user.password = password; // hashed by the User pre-save hook
      await user.save();
    }

    return res.json(doctor);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @route   DELETE /api/doctors/:id
// @desc    Admin removes a doctor, their login and their appointments
// @access  Private (ADMIN)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await Appointment.deleteMany({ doctor: doctor._id });
    if (doctor.user) await User.findByIdAndDelete(doctor.user);
    await doctor.deleteOne();
    return res.json({ message: 'Doctor removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorsAdmin,
  getMyProfile,
  updateMyAvailability,
  getDoctorById,
  getDoctorSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
