const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const isValidCollegeId = (id) => {
  const pattern = /^[0-9]{8,9}$/;
  return pattern.test(id);
};

const isValidEmailFormat = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

const register = async (req, res) => {
  try {
    const { collegeId, name, email, personalEmail, password } = req.body;

    if (!collegeId || !name || !email || !personalEmail || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!isValidCollegeId(collegeId)) {
      return res.status(400).json({ message: 'Invalid college ID format.' });
    }

    if (!email.endsWith('@geu.ac.in')) {
      return res.status(400).json({ message: 'Please use your college email address.' });
    }

    if (!isValidEmailFormat(personalEmail)) {
      return res.status(400).json({ message: 'Please enter a valid personal email address.' });
    }

    const existingUser = await User.findOne({
      $or: [{ collegeId: collegeId.toUpperCase() }, { email: email.toLowerCase() }]
    });
    if (existingUser) {
      return res.status(409).json({ message: 'College ID or email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      collegeId: collegeId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      personalEmail: personalEmail.toLowerCase(),
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, collegeId: user.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome Email asynchronously (don't await it so we don't slow down registration)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      transporter.sendMail({
        from: `"RidePool GEU" <${process.env.EMAIL_USER}>`,
        to: user.personalEmail,
        subject: 'Welcome to RidePool GEU! 🚗',
        html: `
          <div style="font-family: 'Outfit', sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #0c0c14; color: #f5f5ff; border-radius: 16px; border: 1px solid #1a1a30;">
            <h1 style="color: #e63946; font-size: 1.8rem; margin-bottom: 0.5rem; text-align: center;">Welcome, ${user.name}! 🎉</h1>
            <p style="color: #8888aa; font-size: 1.05rem; text-align: center; margin-bottom: 2rem;">Your account has been successfully created.</p>
            <div style="background: #111120; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #1a1a30;">
              <p style="margin: 0 0 10px 0; color: #f5f5ff;"><strong>College ID:</strong> ${user.collegeId}</p>
              <p style="margin: 0; color: #f5f5ff;"><strong>Personal Email:</strong> ${user.personalEmail}</p>
            </div>
            <p style="color: #8888aa; text-align: center; line-height: 1.6;">You can now start finding and offering rides with fellow GEU students. Save money, travel safe, and earn credits!</p>
            <a href="${process.env.CLIENT_URL || 'https://ride-pooling-system.vercel.app'}" style="display: block; width: fit-content; margin: 2rem auto 0; background: #e63946; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; text-align: center;">Start Riding</a>
          </div>
        `
      }).catch(emailErr => {
        console.error('Failed to send welcome email asynchronously:', emailErr);
      });
    } catch (emailErr) {
      console.error('Failed to initialize welcome email:', emailErr);
    }

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        collegeId: user.collegeId,
        name: user.name,
        email: user.email,
        personalEmail: user.personalEmail,
        credits: user.credits
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { collegeId, password } = req.body;

    if (!collegeId || !password) {
      return res.status(400).json({ message: 'College ID and password are required.' });
    }

    const user = await User.findOne({ collegeId: collegeId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this college ID.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user._id, collegeId: user.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        collegeId: user.collegeId,
        name: user.name,
        email: user.email,
        personalEmail: user.personalEmail,
        credits: user.credits,
        rating: user.rating,
        totalRidesOffered: user.totalRidesOffered
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── Forgot Password ──
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ personalEmail: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this personal email.' });
    }

    // Generate reset token (JWT, 15min expiry)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"RidePool GEU" <${process.env.EMAIL_USER}>`,
      to: user.personalEmail,
      subject: 'RidePool GEU - Password Reset',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #12121c; color: #f0f0ff; border-radius: 16px;">
          <h1 style="color: #e63946; font-size: 1.5rem; margin-bottom: 0.5rem;">Password Reset</h1>
          <p style="color: #9999bb;">Hi ${user.name},</p>
          <p style="color: #9999bb;">You requested a password reset for your RidePool GEU account. Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #e63946; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 1rem 0;">Reset Password</a>
          <p style="color: #55556a; font-size: 0.85rem;">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Password reset link sent to your personal email.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error sending reset email.' });
  }
};

// ── Reset Password ──
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"RidePool GEU" <${process.env.EMAIL_USER}>`,
        to: user.personalEmail,
        subject: 'RidePool GEU - Password Changed Successfully',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #12121c; color: #f0f0ff; border-radius: 16px;">
            <h1 style="color: #22c55e; font-size: 1.5rem; margin-bottom: 0.5rem;">✓ Password Changed</h1>
            <p style="color: #9999bb;">Hi ${user.name},</p>
            <p style="color: #9999bb;">Your RidePool GEU password was successfully changed on ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.</p>
            <p style="color: #9999bb;">If you did not make this change, please contact us immediately.</p>
            <p style="color: #55556a; font-size: 0.85rem; margin-top: 1.5rem;">— RidePool GEU Team</p>
          </div>
        `
      });
    } catch (emailErr) {
      // Don't fail the reset if confirmation email fails
      console.error('Confirmation email failed:', emailErr);
    }

    res.status(200).json({ message: 'Password reset successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };