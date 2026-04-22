const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Receptionist/Admin ko Register karne ka function
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check karein agar user pehle se majood hai
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Password ko Hash (secure) karna
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Naya user DB mein save karna
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. Login karne ka function
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User ko email se find karein
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Email or Password' });

    // Password match karein (Jo user ne dala hai aur jo DB mein hash hai)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Email or Password' });

    // Agar password theek hai toh JWT Token (VIP Pass) banayen
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // Token 1 din baad expire ho jayega
    );

    res.status(200).json({ message: 'Login successful', token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check agar email pehle se exist karti hai
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Naya account create karo (Role default Receptionist hoga agar kuch nahi bheja)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Receptionist', 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'Staff account created successfully'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};