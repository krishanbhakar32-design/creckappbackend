// Yeh file study notes (text) ko actual downloadable PDF file mein convert karti hai
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createPdfFromNotes(notes, filename) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'pdfs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true }); // folder nahi hai to bana do
    }

    const filePath = path.join(uploadsDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(22).fillColor('#2b2d42').text(notes.title, { align: 'center' });
    doc.moveDown(1.5);

    // Har section ko likho
    notes.sections.forEach((section) => {
      doc.fontSize(16).fillColor('#4361ee').text(section.heading);
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333333').text(section.content, { align: 'left', lineGap: 4 });
      doc.moveDown(1);
    });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/pdfs/${filename}`)); // yeh path database mein save hoga
    stream.on('error', reject);
  });
}

module.exports = { createPdfFromNotes };
