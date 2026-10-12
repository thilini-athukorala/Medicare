const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('PATIENT'), createAppointment);
router.get('/my', protect, authorize('PATIENT'), getMyAppointments);
router.get('/doctor', protect, authorize('DOCTOR'), getDoctorAppointments);
router.get('/', protect, authorize('ADMIN'), getAllAppointments);
router.put('/:id/status', protect, authorize('DOCTOR', 'ADMIN'), updateAppointmentStatus);
router.put('/:id/reschedule', protect, authorize('DOCTOR', 'ADMIN'), rescheduleAppointment);
router.put('/:id/cancel', protect, authorize('PATIENT'), cancelAppointment);

module.exports = router;
