// Yeh file doubt-solving ka logic handle karti hai
const { solveDoubt } = require('../config/gemini');

exports.askDoubt = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Sawal likho pehle' });
    }
    const answer = await solveDoubt(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Jawab dene mein error aayi', error: error.message });
  }
};
