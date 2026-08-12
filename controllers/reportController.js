// Yeh file question-report system handle karti hai (user kisi galat/confusing question ko flag kar sakta hai)
const QuestionReport = require('../models/QuestionReport');

// USER: Ek question report karna
exports.createReport = async (req, res) => {
  try {
    const { testId, questionIndex, reason, details } = req.body;
    const report = await QuestionReport.create({
      user: req.user.id,
      test: testId,
      questionIndex,
      reason,
      details: details || '',
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Report submit karne mein error aayi', error: error.message });
  }
};

// ADMIN: Sab reports dekhna (pending sabse upar)
exports.getReports = async (req, res) => {
  try {
    const reports = await QuestionReport.find()
      .populate('user', 'name email')
      .populate('test', 'title examCategory')
      .sort({ status: 1, createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Reports laane mein error aayi', error: error.message });
  }
};

// ADMIN: Report ka status update karna (reviewed/resolved mark karna)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await QuestionReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report nahi mila' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Status update karne mein error aayi', error: error.message });
  }
};
