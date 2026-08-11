// Yeh file define karti hai test-related sab URLs
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  generateTest,
  publishTest,
  getTests,
  getTestById,
  submitTest,
} = require('../controllers/testController');

// Admin-only routes (sirf tum use kar paoge, login ke saath admin role chahiye)
router.post('/generate', protect, adminOnly, generateTest); // AI se test banwana (review ke liye)
router.post('/publish', protect, adminOnly, publishTest); // Review ke baad publish karna

// User routes (koi bhi logged-in user use kar sakta hai)
router.get('/', getTests); // Sab tests dekhna (login zaroori nahi, public list)
router.get('/:id', getTestById); // Ek test kholna attempt karne ke liye
router.post('/submit', protect, submitTest); // Test submit karna (login zaroori hai, taaki history save ho)

module.exports = router;
