// Yeh file store karti hai jab bhi koi user koi test attempt kare, uska record
const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // kis user ne attempt kiya
    ref: 'User',
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId, // kaunsa test attempt kiya
    ref: 'Test',
    required: true,
  },
  answers: [
    {
      questionIndex: Number, // test ke questions array mein position
      selectedOptionIndex: Number, // user ne kaunsa option choose kiya (null agar skip kiya)
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctCount: Number,
  wrongCount: Number,
  unattemptedCount: Number,
  timeTakenSeconds: Number,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
