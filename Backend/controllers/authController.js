const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
  const { fullName, companyName, email, password } = req.body;
  console.log("Register request received:", req.body);

  try {
    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields (Full Name, Company Name, Email, Password) are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: 'User already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, companyName, email, password: hashedPassword });
    await newUser.save();
    
    console.log("New user created:", newUser.email);

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      token,
      fullName: newUser.fullName,
      companyName: newUser.companyName,
      message: 'User registered successfully!'
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request received:", req.body);

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log("User logged in:", user.email);

    return res.status(200).json({
      token,
      fullName: user.fullName,
      companyName: user.companyName,
      message: 'Login successful!'
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
