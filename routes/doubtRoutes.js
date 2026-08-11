const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { askDoubt } = require('../controllers/doubtController');

router.post('/ask', protect, askDoubt); // Login zaroori hai spam rokne ke liye

module.exports = router;
