// Yeh file study notes (text) ko actual downloadable, branded PDF file mein convert karti hai
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const BRAND_NAME = 'MockPulse';
const BRAND_URL = 'https://mockpulse.vercel.app';
const BRAND_COLOR = '#7c3aed'; // violet-600, website ke primary color se match
const BRAND_COLOR_DARK = '#5b21b6';
const TEXT_COLOR = '#1a1425';
const MUTED_COLOR = '#6b7280';

// Logo ko vector shapes se draw karta hai (koi image file nahi, koi copyright issue nahi).
// Concept: ek circle ke andar EKG/heartbeat-style zigzag line - "Pulse" idea ko represent karta hai.
function drawLogo(doc, x, y, size = 24) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // Outer circle badge
  doc.save();
  doc.circle(cx, cy, r).fill(BRAND_COLOR);

  // Pulse/heartbeat zigzag line, white, andar
  const lineY = cy;
  const w = size * 0.7;
  const startX = cx - w / 2;
  doc
    .moveTo(startX, lineY)
    .lineTo(startX + w * 0.18, lineY)
    .lineTo(startX + w * 0.3, lineY - size * 0.28)
    .lineTo(startX + w * 0.42, lineY + size * 0.32)
    .lineTo(startX + w * 0.54, lineY - size * 0.18)
    .lineTo(startX + w * 0.68, lineY)
    .lineTo(startX + w, lineY)
    .lineWidth(size * 0.09)
    .lineJoin('round')
    .strokeColor('#ffffff')
    .stroke();

  doc.restore();
}

// Header: logo + brand name (top), aur ek thin colored rule niche
function drawHeader(doc) {
  const startY = 35;
  drawLogo(doc, doc.page.margins.left, startY, 22);
  doc
    .fontSize(13)
    .fillColor(TEXT_COLOR)
    .font('Helvetica-Bold')
    .text(BRAND_NAME, doc.page.margins.left + 30, startY + 3);
  doc
    .fontSize(8)
    .fillColor(MUTED_COLOR)
    .font('Helvetica')
    .text(BRAND_URL, doc.page.margins.left + 30, startY + 17);

  // Right side: category/subject tag can go here later if needed
  doc
    .moveTo(doc.page.margins.left, startY + 34)
    .lineTo(doc.page.width - doc.page.margins.right, startY + 34)
    .lineWidth(1.5)
    .strokeColor(BRAND_COLOR)
    .stroke();
}

// Footer: brand text (left) + page number (right), har page ke neeche
function drawFooter(doc, pageNumber) {
  const y = doc.page.height - doc.page.margins.bottom + 12;
  const fullWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc
    .fontSize(8)
    .fillColor(MUTED_COLOR)
    .font('Helvetica')
    .text(`${BRAND_NAME} — Free Mock Tests for SSC, Banking & Railway`, doc.page.margins.left, y, {
      width: fullWidth - 60,
      height: 20,
      align: 'left',
      lineBreak: false,
    });
  doc
    .fontSize(8)
    .fillColor(MUTED_COLOR)
    .text(`Page ${pageNumber}`, doc.page.margins.left + fullWidth - 60, y, {
      width: 60,
      height: 20,
      align: 'right',
      lineBreak: false,
    });
}

function createPdfFromNotes(notes, filename, meta = {}) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'pdfs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    const doc = new PDFDocument({
      margins: { top: 110, bottom: 60, left: 50, right: 50 },
      bufferPages: true, // taaki hum baad mein sab pages pe footer add kar sakein
    });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    drawHeader(doc);

    // Meta tag (category / subject / topic) chhota badge jaisa
    if (meta.examCategory || meta.subject) {
      const tag = [meta.examCategory, meta.subject, meta.topic].filter(Boolean).join('  •  ');
      doc
        .fontSize(9)
        .fillColor(BRAND_COLOR)
        .font('Helvetica-Bold')
        .text(tag.toUpperCase(), { align: 'left' });
      doc.moveDown(0.5);
    }

    // Title
    doc.fontSize(20).fillColor(TEXT_COLOR).font('Helvetica-Bold').text(notes.title);
    doc.moveDown(1.2);

    // Sections
    notes.sections.forEach((section, index) => {
      doc.fontSize(14).fillColor(BRAND_COLOR_DARK).font('Helvetica-Bold').text(section.heading);
      doc.moveDown(0.4);
      doc
        .fontSize(11)
        .fillColor(TEXT_COLOR)
        .font('Helvetica')
        .text(section.content, { align: 'left', lineGap: 4 });
      // Last section ke baad moveDown skip karte hain, warna agar content page ke bottom ke
      // bilkul paas khatam hua to pdfkit ek extra khaali page bana deta hai
      if (index < notes.sections.length - 1) {
        doc.moveDown(1.1);
      }
    });

    finalizePages(doc);
    doc.end();

    stream.on('finish', () => {
      resolve(`/uploads/pdfs/${filename}`);
    });
    stream.on('error', reject);
  });
}

// Alag function: header (sirf pehle page pe) already draw ho chuka; ye har page pe footer +
// baad ke pages pe chhota header lagata hai. pdfkit mein bufferPages ke saath range switch karke
// har page pe likhna padta hai, isliye ye createPdfFromNotes ke doc.end() se pehle call hota hai.
function finalizePages(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    if (i > 0) drawHeader(doc); // pehle page pe already hai, baaki pages pe bhi lagao
    drawFooter(doc, i + 1);
  }
}

module.exports = { createPdfFromNotes };
