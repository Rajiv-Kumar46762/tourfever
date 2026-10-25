const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

exports.register = async (req, res) => {
  try {
    const { username, password, email, name, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
    }

    const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username.trim().toLowerCase(),
      password: hash,
      email: email ? email.trim().toLowerCase() : undefined,
      name: name ? name.trim() : username.trim(),
      phone: phone ? phone.trim() : undefined,
      role: 'user'
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanUsername }
      ]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
