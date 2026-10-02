const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @route   POST /api/appointments
// @desc    Patient books a new appointment
// @access  Private (PATIENT)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Prevent double-booking the same doctor at the same date + slot
    const clash = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED'] }
    });
    if (clash) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      reason
    });

    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/appointments/my
// @desc    Get appointments for the logged-in patient
// @access  Private (PATIENT)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .sort({ appointmentDate: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/appointments/doctor
// @desc    Get appointments for the logged-in doctor
// @access  Private (DOCTOR)
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/appointments/:id/status
// @desc    Doctor updates appointment status (CONFIRMED / COMPLETED / CANCELLED)
// @access  Private (DOCTOR)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
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
  updateAppointmentStatus,
  cancelAppointment
};
