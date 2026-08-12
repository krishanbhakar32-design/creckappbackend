// Yeh script ek admin account bana deta hai (ya existing account ko admin bana deta hai)
// Chalane ka tarika: node seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL || 'admin@crackprep.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123'; // testing ke liye, baad mein change kar lena

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log('⚠️ Ye user pehle se admin hai. Email:', email);
    } else {
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Existing account ko admin bana diya!');
      console.log('Email:', email);
    }
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
