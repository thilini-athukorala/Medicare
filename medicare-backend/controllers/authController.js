const User = require('../models/User');
const Doctor = require('../models/Doctor');
const generateToken = require('../middleware/generateToken');

// @route   POST /api/auth/register
// @desc    Register a new user (patient by default, or doctor)
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialty } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT' // ADMIN accounts should be created manually, not via public register
    });

    // If registering as a doctor, also create a linked Doctor profile
    if (user.role === 'DOCTOR') {
      await Doctor.create({
        user: user._id,
        specialty: specialty || 'General Physician'
      });
    }

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
// @desc    Login and receive a JWT token
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get the currently logged-in user's profile
// @access  Private
const getMe = async (req, res) => {
  return res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
