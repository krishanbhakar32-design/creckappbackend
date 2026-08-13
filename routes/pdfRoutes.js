const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { generateNotes, publishNotes, getPdfs, deletePdf } = require('../controllers/pdfController');

router.post('/generate', protect, adminOnly, generateNotes); // AI se notes banwana
router.post('/publish', protect, adminOnly, publishNotes); // Review ke baad PDF publish karna
router.get('/', getPdfs); // Sab PDFs dekhna
router.delete('/:id', protect, adminOnly, deletePdf); // PDF delete karna

module.exports = router;
