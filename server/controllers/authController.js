const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const isValidCollegeId = (id) => {
  const pattern = /^[0-9]{8,9}$/;
  return pattern.test(id);
};

const register = async (req, res) => {
  try {
    const { collegeId, name, email, password } = req.body;

    if (!collegeId || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!isValidCollegeId(collegeId)) {
      return res.status(400).json({ message: 'Invalid college ID format.' });
    }

    if (!email.endsWith('@geu.ac.in')) {
      return res.status(400).json({ message: 'Please use your college email address.' });
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
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, collegeId: user.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        collegeId: user.collegeId,
        name: user.name,
        email: user.email,
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
        collegeId: user.collegeId,
        name: user.name,
        email: user.email,
        credits: user.credits,
        rating: user.rating
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

module.exports = { register, login, getMe };