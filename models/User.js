// Yeh file define karti hai ki ek "User" ka data database mein kaise store hoga
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // ek email se sirf ek account ban sakta hai
    lowercase: true,
  },
  password: {
    type: String,
    required: true, // yeh hamesha encrypted (hashed) save hoga, plain text kabhi nahi
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // sirf yeh do values allowed hain
    default: 'user', // naya signup karne wala hamesha normal "user" hota hai
  },
  examPreference: {
    type: String, // jaise "SSC", "Banking" - future mein use hoga personalization ke liye
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
