const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateOTP, sendOTPEmail } = require('../utils/mailer');

const OTP_EXPIRY_MINUTES = 10;

// ============================
// REGISTER
// ============================
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      // Unverified user re-registering — update their record
      user.name = name;
      user.password = hashedPassword;
      // Allow only 'user' or 'admin' during public registration
      user.role = ['user', 'admin'].includes(role) ? role : 'user';
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        role: ['user', 'admin'].includes(role) ? role : 'user', 
        otp, 
        otpExpiry 
      });
      await user.save();
    }

    await sendOTPEmail(email, otp, 'Verify Your Email — LibraryPro');
    res.json({ msg: 'OTP sent to your email. Please verify to complete registration.', email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// ============================
// VERIFY OTP (after registration)
// ============================
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (user.isVerified) return res.status(400).json({ msg: 'Account already verified' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if (err) return res.status(500).json({ msg: 'Token error' });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// RESEND OTP
// ============================
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (user.isVerified) return res.status(400).json({ msg: 'Account already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp, 'Your New OTP — LibraryPro');
    res.json({ msg: 'New OTP sent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// FORGOT PASSWORD
// ============================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'No account found with this email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp, 'Reset Your Password — LibraryPro');
    res.json({ msg: 'Password reset OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// RESET PASSWORD
// ============================
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ msg: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// LOGIN
// ============================
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in.', needsVerification: true, email });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ msg: `Access denied. You do not have an ${role} account.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if (err) return res.status(500).json({ msg: 'Token error' });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// GET CURRENT USER
// ============================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// GET ALL USERS (Admin only)
// ============================
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// UPDATE USER ROLE (Admin only)
// ============================
router.put('/users/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    const { role } = req.body;
    
    if (!['admin', 'librarian', 'user'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Last Admin Protection: Prevent demoting the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ msg: 'Critical Error: There must be at least one administrator in the system.' });
      }
    }

    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ msg: 'You cannot demote yourself' });
    }

    user.role = role;
    await user.save();
    res.json({ msg: `User role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// ADD NEW STAFF (Admin only)
// ============================
router.post('/admin/add', auth, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    if (!['admin', 'librarian'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid staff role' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true // Direct add by admin is auto-verified
    });

    await user.save();
    res.json({ msg: `New ${role} added successfully`, user: { id: user.id, name, email, role } });
  } catch (err) {
    console.error('Add staff error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ============================
// DELETE USER (Admin only)
// ============================
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    if (req.params.id === req.user.id) return res.status(400).json({ msg: 'Cannot delete your own account' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Last Admin Protection: Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ msg: 'Critical Error: There must be at least one administrator in the system.' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
