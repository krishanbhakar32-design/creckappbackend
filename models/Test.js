// Yeh file define karti hai ki ek "Test" (jaise SSC CGL Maths Sectional Test) kaise store hoga
const mongoose = require('mongoose');

// Har question ka structure (ek test ke andar multiple questions honge)
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String], // 4 options ka array, jaise ["Option A", "Option B", "Option C", "Option D"]
    required: true,
  },
  correctAnswerIndex: {
    type: Number, // 0, 1, 2, ya 3 - options array mein sahi jawab ka position
    required: true,
  },
  explanation: {
    type: String, // sahi jawab kyu sahi hai, uski detail
    default: '',
  },
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // jaise "SSC CGL Maths Sectional Test"
  },
  examCategory: {
    type: String,
    required: true, // jaise "SSC", "Banking", "Railway"
  },
  subCategory: {
    type: String, // jaise "SSC CGL", "SSC CHSL"
    default: '',
  },
  testType: {
    type: String,
    enum: ['full-mock', 'sectional', 'topic-wise'], // teen tarah ke tests
    required: true,
  },
  subject: {
    type: String, // jaise "Maths", "Reasoning", "English", "GK" - sectional/topic-wise ke liye
    default: '',
  },
  durationMinutes: {
    type: Number,
    required: true, // sectional tests ke liye yeh 15 rahega (jaisa decide hua)
  },
  questions: [questionSchema], // upar wala structure yahan array ki tarah use hoga
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Test', testSchema);
