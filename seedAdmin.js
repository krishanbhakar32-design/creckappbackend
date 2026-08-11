// Yeh script ek admin account bana deta hai testing ke liye
// Chalane ka tarika: node seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@crackprep.com';
  const password = 'admin123'; // testing ke liye, baad mein change kar lena

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('⚠️ Admin already exists. Email:', email);
    process.exit();
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name: 'Admin',
    email,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('✅ Admin account ban gaya!');
  console.log('Email:', email);
  console.log('Password:', password);
  process.exit();
}

seedAdmin();
