const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { slotsForDate, toDateKey } = require('../utils/slots');

const ACTIVE = ['PENDING', 'CONFIRMED'];

// Returns an error message if the date/slot cannot be booked, otherwise null.
const checkSlot = async (doctor, appointmentDate, timeSlot, excludeId) => {
  const dateKey = toDateKey(appointmentDate);
  if (dateKey < new Date().toISOString().slice(0, 10)) {
    return 'You cannot choose a date in the past';
  }
  if (!slotsForDate(doctor, dateKey).includes(timeSlot)) {
    return 'The doctor is not available at that date and time';
  }
  const query = {
    doctor: doctor._id,
    appointmentDate: new Date(dateKey),
    timeSlot,
    status: { $in: ACTIVE }
  };
  if (excludeId) query._id = { $ne: excludeId };
  if (await Appointment.findOne(query)) return 'This time slot is already booked';
  return null;
};

// For DOCTOR users: make sure the appointment belongs to them. Admins may touch any.
const loadAppointmentFor = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404).json({ message: 'Appointment not found' });
    return null;
  }
  const doctor = await Doctor.findById(appointment.doctor);
  if (req.user.role === 'DOCTOR' && (!doctor || String(doctor.user) !== String(req.user._id))) {
    res.status(403).json({ message: 'You can only manage your own appointments' });
    return null;
  }
  return { appointment, doctor };
};

// @route   POST /api/appointments
// @access  Private (PATIENT)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const problem = await checkSlot(doctor, appointmentDate, timeSlot);
    if (problem) return res.status(400).json({ message: problem });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(toDateKey(appointmentDate)),
      timeSlot,
      reason
    });

    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/appointments/my
// @access  Private (PATIENT)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name specialty hospital')
      .sort({ appointmentDate: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/appointments/doctor
// @desc    The logged-in doctor's own appointments
// @access  Private (DOCTOR)
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: 1, timeSlot: 1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/appointments
// @access  Private (ADMIN)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialty hospital')
      .sort({ appointmentDate: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/appointments/:id/status
// @desc    Confirm / complete / cancel (doctor: own appointments, admin: any)
// @access  Private (DOCTOR, ADMIN)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const found = await loadAppointmentFor(req, res);
    if (!found) return;

    found.appointment.status = status;
    await found.appointment.save();
    return res.json(found.appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/appointments/:id/reschedule
// @desc    Move an appointment to another available date/time
// @access  Private (DOCTOR, ADMIN)
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, timeSlot } = req.body;
    if (!appointmentDate || !timeSlot) {
      return res.status(400).json({ message: 'New date and time slot are required' });
    }

    const found = await loadAppointmentFor(req, res);
    if (!found) return;
    const { appointment, doctor } = found;

    if (!ACTIVE.includes(appointment.status)) {
      return res.status(400).json({ message: 'Only pending or confirmed appointments can be rescheduled' });
    }

    const problem = await checkSlot(doctor, appointmentDate, timeSlot, appointment._id);
    if (problem) return res.status(400).json({ message: problem });

    appointment.appointmentDate = new Date(toDateKey(appointmentDate));
    appointment.timeSlot = timeSlot;
    await appointment.save();
    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/appointments/:id/cancel
// @desc    Patient cancels their own appointment
// @access  Private (PATIENT)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }

    appointment.status = 'CANCELLED';
    await appointment.save();
    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment
};
