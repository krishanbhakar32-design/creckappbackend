// Yeh file leaderboard related URLs define karti hai
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTestLeaderboard } = require('../controllers/leaderboardController');

router.get('/:testId', protect, getTestLeaderboard); // Ek test ka leaderboard dekhna (login zaroori)

module.exports = router;
