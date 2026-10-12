const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorsAdmin,
  getMyProfile,
  updateMyAvailability,
  getDoctorById,
  getDoctorSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);

// These fixed paths must come BEFORE '/:id' so they are not mistaken for an id
router.get('/admin/list', protect, authorize('ADMIN'), getDoctorsAdmin);
router.get('/me', protect, authorize('DOCTOR'), getMyProfile);
router.put('/me/availability', protect, authorize('DOCTOR'), updateMyAvailability);

router.get('/:id/slots', getDoctorSlots);
router.get('/:id', getDoctorById);
router.post('/', protect, authorize('ADMIN'), createDoctor);
router.put('/:id', protect, authorize('ADMIN'), updateDoctor);
router.delete('/:id', protect, authorize('ADMIN'), deleteDoctor);

module.exports = router;
