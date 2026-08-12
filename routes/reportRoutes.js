// Yeh file question-report related sab URLs define karti hai
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');

router.post('/', protect, createReport); // User koi question report kare (login zaroori)
router.get('/', protect, adminOnly, getReports); // Admin sab reports dekhe
router.patch('/:id', protect, adminOnly, updateReportStatus); // Admin status update kare

module.exports = router;
