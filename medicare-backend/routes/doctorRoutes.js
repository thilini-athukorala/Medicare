const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateMyDoctorProfile } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.put('/me', protect, authorize('DOCTOR'), updateMyDoctorProfile);
router.get('/:id', getDoctorById);

module.exports = router;
