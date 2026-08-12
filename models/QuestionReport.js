// Yeh model store karta hai jab koi user kisi question ko report karta hai
// (jaise "answer galat hai", "question confusing hai", "typo hai" waghera)
const mongoose = require('mongoose');

const questionReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    questionIndex: { type: Number, required: true }, // test.questions array mein kaunsa question
    reason: {
      type: String,
      enum: ['wrong-answer', 'confusing-question', 'typo', 'duplicate', 'other'],
      required: true,
    },
    details: { type: String, default: '' }, // user ka extra comment (optional)
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuestionReport', questionReportSchema);
