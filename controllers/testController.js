// Yeh file test se related sab logic handle karti hai
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const { generateTestQuestions } = require('../config/gemini');

// ADMIN: AI se naya test generate karna (sirf review ke liye, abhi publish nahi hota)
exports.generateTest = async (req, res) => {
  try {
    const { title, examCategory, subCategory, testType, subject, topic, numQuestions, durationMinutes, difficulty } = req.body;

    // Gemini AI ko call karo questions banane ke liye
    const questions = await generateTestQuestions({
      examCategory,
      subject,
      topic,
      numQuestions: numQuestions || 20,
      difficulty,
    });

    // Abhi database mein save NAHI karte - pehle admin ko review ke liye bhejte hain
    res.json({
      title,
      examCategory,
      subCategory,
      testType,
      subject,
      durationMinutes: durationMinutes || 15, // sectional tests ke liye default 15 min
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Test generate karne mein error aayi', error: error.message });
  }
};

// ADMIN: Review ke baad test ko actually publish (save) karna
exports.publishTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ message: 'Test publish ho gaya!', test });
  } catch (error) {
    res.status(500).json({ message: 'Publish karne mein error aayi', error: error.message });
  }
};

// USER: Sab tests ki list dekhna (filter ke saath)
exports.getTests = async (req, res) => {
  try {
    const { examCategory, testType, subject } = req.query;
    const filter = {};
    if (examCategory) filter.examCategory = examCategory;
    if (testType) filter.testType = testType;
    if (subject) filter.subject = subject;

    // List mein questions ka full data nahi bhejte (bahut bada hota hai), sirf basic info
    const tests = await Test.find(filter).select('-questions.correctAnswerIndex -questions.explanation');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error aayi', error: error.message });
  }
};

// USER: Ek specific test attempt karne ke liye kholna (correct answers hide rehte hain)
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).select('-questions.correctAnswerIndex -questions.explanation');
    if (!test) return res.status(404).json({ message: 'Test nahi mila' });

    // Agar test schedule hua hai aur abhi time nahi aaya, to attempt block karo
    if (test.scheduledAt && new Date(test.scheduledAt) > new Date()) {
      return res.status(403).json({
        message: 'Yeh test abhi live nahi hua hai',
        scheduledAt: test.scheduledAt,
      });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error aayi', error: error.message });
  }
};

// USER: Test submit karna aur result calculate karna
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers, timeTakenSeconds } = req.body; // answers = [{questionIndex, selectedOptionIndex}]
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test nahi mila' });

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    test.questions.forEach((question, index) => {
      const userAnswer = answers.find((a) => a.questionIndex === index);
      if (!userAnswer || userAnswer.selectedOptionIndex === null || userAnswer.selectedOptionIndex === undefined) {
        unattemptedCount++;
      } else if (userAnswer.selectedOptionIndex === question.correctAnswerIndex) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const score = correctCount; // simple scoring: 1 mark per correct (negative marking baad me add kar sakte hain)

    const attempt = await TestAttempt.create({
      user: req.user.id,
      test: testId,
      answers,
      score,
      totalQuestions: test.questions.length,
      correctCount,
      wrongCount,
      unattemptedCount,
      timeTakenSeconds,
    });

    // Result ke saath sahi answers aur explanation bhi bhej do ab
    res.json({
      attempt,
      correctAnswers: test.questions.map((q) => ({
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Submit karne mein error aayi', error: error.message });
  }
};
