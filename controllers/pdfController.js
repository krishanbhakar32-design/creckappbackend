// Yeh file PDF notes se related sab logic handle karti hai
const fs = require('fs');
const path = require('path');
const StudyPdf = require('../models/StudyPdf');
const { generateStudyNotes } = require('../config/gemini');
const { createPdfFromNotes } = require('../config/pdfGenerator');

// ADMIN: AI se notes generate karna (review ke liye, PDF nahi banti abhi)
exports.generateNotes = async (req, res) => {
  try {
    const { examCategory, subject, topic, customPrompt } = req.body;
    const notes = await generateStudyNotes({ examCategory, subject, topic, customPrompt });
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
    const fileUrl = await createPdfFromNotes(notes, filename, { examCategory, subject, topic });

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

// ADMIN: Ek PDF delete karna (file aur database record dono)
exports.deletePdf = async (req, res) => {
  try {
    const pdf = await StudyPdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'PDF nahi mila' });

    // Actual file bhi disk se delete karo
    const filePath = path.join(__dirname, '..', pdf.fileUrl.replace(/^\//, ''));
    fs.unlink(filePath, () => {}); // agar file na mile to bhi ignore karo, DB record to delete hoga hi

    await StudyPdf.findByIdAndDelete(req.params.id);
    res.json({ message: 'PDF delete ho gaya' });
  } catch (error) {
    res.status(500).json({ message: 'Delete karne mein error aayi', error: error.message });
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
