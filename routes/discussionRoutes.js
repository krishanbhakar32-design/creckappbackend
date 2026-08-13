// Yeh file discussion-panel related URLs define karti hai
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDiscussion, postMessage } = require('../controllers/discussionController');

router.get('/:testId', getDiscussion); // Sab dekh sakte hain, login zaroori nahi
router.post('/:testId', protect, postMessage); // Post karne ke liye login zaroori

module.exports = router;
