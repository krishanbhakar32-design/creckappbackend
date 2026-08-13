// Yeh file per-test discussion panel handle karti hai
const Discussion = require('../models/Discussion');

// PUBLIC: Ek test ke saare discussion messages dekhna
exports.getDiscussion = async (req, res) => {
  try {
    const messages = await Discussion.find({ test: req.params.testId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Discussion laane mein error aayi', error: error.message });
  }
};

// USER: Naya message post karna
exports.postMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message khaali nahi ho sakta' });
    }
    const discussion = await Discussion.create({
      test: req.params.testId,
      user: req.user.id,
      message: message.trim(),
    });
    const populated = await discussion.populate('user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Message post karne mein error aayi', error: error.message });
  }
};
