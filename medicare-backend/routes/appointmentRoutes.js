const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('PATIENT'), createAppointment);
router.get('/my', protect, authorize('PATIENT'), getMyAppointments);
router.get('/doctor', protect, authorize('DOCTOR'), getDoctorAppointments);
router.put('/:id/status', protect, authorize('DOCTOR'), updateAppointmentStatus);
router.put('/:id/cancel', protect, authorize('PATIENT'), cancelAppointment);

module.exports = router;
