// Yeh file define karti hai ki ek "Test" (jaise SSC CGL Maths Sectional Test) kaise store hoga
const mongoose = require('mongoose');

// Har question ka structure (ek test ke andar multiple questions honge)
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionTextHi: {
    type: String, // Hindi translation, test ke andar language-toggle ke liye
    default: '',
  },
  options: {
    type: [String], // 4 options ka array, jaise ["Option A", "Option B", "Option C", "Option D"]
    required: true,
  },
  optionsHi: {
    type: [String], // options ka Hindi translation
    default: [],
  },
  correctAnswerIndex: {
    type: Number, // 0, 1, 2, ya 3 - options array mein sahi jawab ka position
    required: true,
  },
  explanation: {
    type: String, // sahi jawab kyu sahi hai, uski detail
    default: '',
  },
  explanationHi: {
    type: String, // explanation ka Hindi translation
    default: '',
  },
  sectionName: {
    type: String, // full-mock tests mein yeh question kis section ka hai
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
  topic: {
    type: String, // jaise "Percentage", "Time & Work" - topic-wise/chapter-wise tests ke liye
    default: '',
  },
  // Full-mock tests mein har section (jaise Maths, Reasoning) ka apna alag locked time hota hai
  // (jaisa asli SSC CGL exam mein hota hai). Sectional/topic-wise tests iska use nahi karte,
  // unke liye seedha durationMinutes hi poore test ka time hai.
  sections: {
    type: [
      {
        name: { type: String, required: true }, // jaise "Quantitative Aptitude"
        durationMinutes: { type: Number, required: true }, // is section ka locked time
        questionStartIndex: { type: Number, required: true }, // questions array mein kaha se shuru
        questionEndIndex: { type: Number, required: true }, // kaha khatam (exclusive)
      },
    ],
    default: [],
  },
  durationMinutes: {
    type: Number,
    required: true, // sectional tests ke liye yeh 15 rahega (jaisa decide hua); full-mock+sections ke liye yeh sabhi section durations ka total hoga
  },
  // Marking scheme - real exam ke pattern ke hisaab se (jaise SSC: +2/-0.5, IBPS: +1/-0.25, Railway: +1/-0.33)
  correctMarks: {
    type: Number,
    default: 1,
  },
  negativeMarks: {
    type: Number,
    default: 0.25,
  },
  scheduledAt: {
    type: Date, // agar future date hai to test tab tak "upcoming" rahega, attempt nahi hoga
    default: null,
  },
  isLive: {
    type: Boolean, // true tabhi hoga jab scheduledAt time aa jaye (ya scheduling hi na ho)
    default: true,
  },
  questions: [questionSchema], // upar wala structure yahan array ki tarah use hoga
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Test', testSchema);
