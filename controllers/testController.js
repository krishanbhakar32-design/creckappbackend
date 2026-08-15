// Yeh file test se related sab logic handle karti hai
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const { generateTestQuestions, generateFullMockTest } = require('../config/gemini');
const examPatterns = require('../config/examPatterns');
const cutoffs = require('../config/cutoffs');

// USER: Apni attempt history dekhna (dashboard ke liye)
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ user: req.user.id })
      .populate('test', 'title examCategory subject testType')
      .sort({ attemptedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Attempts laane mein error aayi', error: error.message });
  }
};

// PUBLIC/ADMIN: Real exam patterns (SSC/IBPS/RRB ke official section/timing/marking) bhejna
exports.getExamPatterns = (req, res) => {
  res.json(examPatterns);
};

// PUBLIC: Expected category-wise cutoffs bhejna (result page ke liye, reference values)
exports.getCutoffs = (req, res) => {
  res.json(cutoffs);
};

// ADMIN: AI se naya test generate karna (sirf review ke liye, abhi publish nahi hota)
exports.generateTest = async (req, res) => {
  try {
    const {
      title,
      examCategory,
      subCategory,
      testType,
      subject,
      topic,
      numQuestions,
      durationMinutes,
      difficulty,
      correctMarks,
      negativeMarks,
    } = req.body;

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
      correctMarks: correctMarks || 1,
      negativeMarks: negativeMarks !== undefined ? negativeMarks : 0.25,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Test generate karne mein error aayi', error: error.message });
  }
};

// ADMIN: Full-length mock test generate karna, jisme multiple sections ho (har section ka apna locked time)
exports.generateFullMock = async (req, res) => {
  try {
    const { title, examCategory, subCategory, sections, difficulty, correctMarks, negativeMarks } = req.body;
    // sections = [{ name: 'Quantitative Aptitude', numQuestions: 25, durationMinutes: 15 }, ...]

    if (!sections || sections.length === 0) {
      return res.status(400).json({ message: 'Kam se kam ek section chahiye' });
    }

    const flatQuestions = await generateFullMockTest({ examCategory, subCategory, sections, difficulty });

    // Ab sections ka questionStartIndex/questionEndIndex nikalte hain based on how many
    // questions Gemini ne actually har section ke liye banaye (sectionName field se match karke)
    let cursor = 0;
    const sectionsWithIndex = sections.map((s) => {
      const sectionQuestions = flatQuestions.filter((q) => q.sectionName === s.name);
      const startIndex = cursor;
      const endIndex = cursor + sectionQuestions.length;
      cursor = endIndex;
      return {
        name: s.name,
        durationMinutes: s.durationMinutes,
        questionStartIndex: startIndex,
        questionEndIndex: endIndex,
        // Agar frontend ne is section ke liye alag marking bheji hai (jaise SSC MTS ke sessions),
        // use yahan save karo taaki scoring time pe use ho
        correctMarks: s.correctMarks ?? null,
        negativeMarks: s.negativeMarks ?? null,
      };
    });

    const totalDuration = sections.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.json({
      title,
      examCategory,
      subCategory,
      testType: 'full-mock',
      sections: sectionsWithIndex,
      durationMinutes: totalDuration,
      correctMarks: correctMarks || 1,
      negativeMarks: negativeMarks !== undefined ? negativeMarks : 0.25,
      questions: flatQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Full mock test generate karne mein error aayi', error: error.message });
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

// USER: Navigation pages ke liye counts nikalna
// Jaise "SSC ke andar kitne Sectional test hain", "Maths subject ke andar kitne topic-wise test hain" waghera
exports.getTestSummary = async (req, res) => {
  try {
    const summary = await Test.aggregate([
      {
        $group: {
          _id: {
            examCategory: '$examCategory',
            testType: '$testType',
            subject: '$subject',
            topic: '$topic',
          },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error aayi', error: error.message });
  }
};

// USER: Sab tests ki list dekhna (filter ke saath)
// ADMIN: Ek test delete karna
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test nahi mila' });
    res.json({ message: 'Test delete ho gaya' });
  } catch (error) {
    res.status(500).json({ message: 'Delete karne mein error aayi', error: error.message });
  }
};

exports.getTests = async (req, res) => {
  try {
    const { examCategory, subCategory, testType, subject, topic } = req.query;
    const filter = {};
    if (examCategory) filter.examCategory = examCategory;
    if (subCategory) filter.subCategory = subCategory;
    if (testType) filter.testType = testType;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;

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

    // Subject/section ke hisaab se breakdown bhi track karte hain (jaise "Maths: 8/10 correct")
    const breakdownMap = {}; // { sectionName: { correct, wrong, unattempted, total, correctMarks, negativeMarks } }

    const getSection = (question, index) => {
      // full-mock tests mein question.sectionName hota hai; test.sections se poora section object milta hai
      if (test.sections && test.sections.length > 0) {
        const byIndex = test.sections.find((s) => index >= s.questionStartIndex && index < s.questionEndIndex);
        if (byIndex) return byIndex;
        if (question.sectionName) {
          const byName = test.sections.find((s) => s.name === question.sectionName);
          if (byName) return byName;
        }
      }
      return null;
    };

    const defaultCorrectMarks = test.correctMarks || 1;
    const defaultNegativeMarks = test.negativeMarks || 0;

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let score = 0;

    test.questions.forEach((question, index) => {
      const section = getSection(question, index);
      const groupName = section ? section.name : question.sectionName || test.subject || 'General';
      // Per-section marking override agar diya gaya ho (jaise SSC MTS ke sessions), warna test-level default
      const qCorrectMarks = section?.correctMarks ?? defaultCorrectMarks;
      const qNegativeMarks = section?.negativeMarks ?? defaultNegativeMarks;

      if (!breakdownMap[groupName]) {
        breakdownMap[groupName] = { correct: 0, wrong: 0, unattempted: 0, total: 0, marks: 0, maxMarks: 0 };
      }
      breakdownMap[groupName].total++;
      breakdownMap[groupName].maxMarks += qCorrectMarks;

      const userAnswer = answers.find((a) => a.questionIndex === index);
      if (!userAnswer || userAnswer.selectedOptionIndex === null || userAnswer.selectedOptionIndex === undefined) {
        unattemptedCount++;
        breakdownMap[groupName].unattempted++;
      } else if (userAnswer.selectedOptionIndex === question.correctAnswerIndex) {
        correctCount++;
        score += qCorrectMarks;
        breakdownMap[groupName].correct++;
        breakdownMap[groupName].marks += qCorrectMarks;
      } else {
        wrongCount++;
        score -= qNegativeMarks;
        breakdownMap[groupName].wrong++;
        breakdownMap[groupName].marks -= qNegativeMarks;
      }
    });

    score = Number(score.toFixed(2));
    const maxMarks = Number(
      test.questions
        .reduce((sum, q, i) => {
          const section = getSection(q, i);
          return sum + (section?.correctMarks ?? defaultCorrectMarks);
        }, 0)
        .toFixed(2)
    );

    const subjectBreakdown = Object.entries(breakdownMap).map(([name, stats]) => ({
      subject: name,
      correct: stats.correct,
      wrong: stats.wrong,
      unattempted: stats.unattempted,
      total: stats.total,
      marks: Number(stats.marks.toFixed(2)),
      maxMarks: Number(stats.maxMarks.toFixed(2)),
    }));

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

    // Result ke saath sahi answers, explanation, aur subject-wise breakdown bhi bhej do ab
    res.json({
      attempt,
      subjectBreakdown,
      maxMarks,
      correctAnswers: test.questions.map((q) => ({
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Submit karne mein error aayi', error: error.message });
  }
};
