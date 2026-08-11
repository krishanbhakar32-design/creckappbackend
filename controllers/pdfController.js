// Yeh file PDF notes se related sab logic handle karti hai
const StudyPdf = require('../models/StudyPdf');
const { generateStudyNotes } = require('../config/gemini');
const { createPdfFromNotes } = require('../config/pdfGenerator');

// ADMIN: AI se notes generate karna (review ke liye, PDF nahi banti abhi)
exports.generateNotes = async (req, res) => {
  try {
    const { examCategory, subject, topic } = req.body;
    const notes = await generateStudyNotes({ examCategory, subject, topic });
    res.json({ examCategory, subject, topic, notes });
  } catch (error) {
    res.status(500).json({ message: 'Notes generate karne mein error aayi', error: error.message });
  }
};

// ADMIN: Review ke baad actual PDF file banake publish karna
exports.publishNotes = async (req, res) => {
  try {
    const { examCategory, subject, topic, notes } = req.body;

    const filename = `${topic.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const fileUrl = await createPdfFromNotes(notes, filename);

    const studyPdf = await StudyPdf.create({
      title: notes.title,
      examCategory,
      subject,
      topic,
      fileUrl,
    });

    res.status(201).json({ message: 'PDF publish ho gaya!', studyPdf });
  } catch (error) {
    res.status(500).json({ message: 'Publish karne mein error aayi', error: error.message });
  }
};

// USER: Sab PDFs ki list dekhna (filter ke saath)
exports.getPdfs = async (req, res) => {
  try {
    const { examCategory, subject } = req.query;
    const filter = {};
    if (examCategory) filter.examCategory = examCategory;
    if (subject) filter.subject = subject;

    const pdfs = await StudyPdf.find(filter);
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ message: 'Error aayi', error: error.message });
  }
};
