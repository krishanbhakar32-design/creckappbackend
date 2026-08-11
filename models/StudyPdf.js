// Yeh file define karti hai ki ek PDF note kaise store hoga
const mongoose = require('mongoose');

const studyPdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // jaise "Percentage - Detailed Notes"
  },
  examCategory: {
    type: String,
    required: true, // jaise "SSC"
  },
  subject: {
    type: String,
    required: true, // jaise "Maths"
  },
  topic: {
    type: String,
    required: true, // jaise "Percentage"
  },
  fileUrl: {
    type: String,
    required: true, // jaha PDF file actually stored hai (link)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudyPdf', studyPdfSchema);
