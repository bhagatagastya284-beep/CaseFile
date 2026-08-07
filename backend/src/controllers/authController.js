const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  if (!EMAIL_RE.test(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, data: { user: user.toSafeObject(), token } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);
  res.json({ success: true, data: { user: user.toSafeObject(), token } });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT - client discards the token. Endpoint kept for API completeness.
  res.json({ success: true, message: 'Logged out successfully' });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (name) req.user.name = name.trim();
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
});

module.exports = { register, login, logout, getProfile, updateProfile };
