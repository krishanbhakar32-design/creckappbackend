// Yeh file register aur login ka poora logic handle karti hai
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // password ko encrypt karne ke liye
const jwt = require('jsonwebtoken'); // login session ke liye token banane ke liye

// Naya user register karna
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check karo email pehle se registered to nahi hai
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Yeh email pehle se registered hai' });
    }

    // Password ko encrypt karo (kabhi bhi plain text save nahi karte)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Naya user database mein save karo
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Login token generate karo taaki register karte hi user logged-in ho jaye
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Kuch galat ho gaya', error: error.message });
  }
};

// Existing user login karna
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User dhundo email se
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ya password galat hai' });
    }

    // Password check karo (encrypted wale se compare karke)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ya password galat hai' });
    }

    // Token generate karo
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Kuch galat ho gaya', error: error.message });
  }
};

// Kisi existing user ko admin banane ke liye (ek baar use karne wala secret route)
// GET /api/auth/make-admin?email=xyz@gmail.com&secret=ADMIN_SECRET
exports.makeAdmin = async (req, res) => {
  try {
    const { email, secret } = req.query;

    // Security: sirf wahi banaye admin jo ADMIN_SECRET jaanta ho (.env mein set karo)
    if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Galat secret key' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email query param zaroori hai' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Is email se koi user register nahi hai. Pehle register karo.' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ message: `✅ ${email} ab admin ban gaya!` });
  } catch (error) {
    res.status(500).json({ message: 'Kuch galat ho gaya', error: error.message });
  }
};
