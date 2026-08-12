// Yeh file define karti hai test-related sab URLs
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  generateTest,
  generateFullMock,
  publishTest,
  getTests,
  getTestById,
  submitTest,
  getTestSummary,
  getExamPatterns,
} = require('../controllers/testController');

router.get('/patterns', getExamPatterns); // Real exam patterns (SSC/Banking/Railway ke sections/timing/marking)

// Admin-only routes (sirf tum use kar paoge, login ke saath admin role chahiye)
router.post('/generate', protect, adminOnly, generateTest); // AI se test banwana (review ke liye)
router.post('/generate-full-mock', protect, adminOnly, generateFullMock); // Multi-section full mock banwana
router.post('/publish', protect, adminOnly, publishTest); // Review ke baad publish karna

// User routes (koi bhi logged-in user use kar sakta hai)
router.get('/summary', getTestSummary); // Har category/type/subject ke count nikalna (navigation pages ke liye)
router.get('/', getTests); // Sab tests dekhna (login zaroori nahi, public list)
router.get('/:id', getTestById); // Ek test kholna attempt karne ke liye
router.post('/submit', protect, submitTest); // Test submit karna (login zaroori hai, taaki history save ho)

module.exports = router;
