// Yeh file Gemini AI se baat karti hai aur usse questions generate karwati hai
// NOTE: Purana package '@google/generative-ai' Google ne 31 Aug 2025 ko band kar diya (EOL).
// Ab hum naya official SDK '@google/genai' use karte hain.
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini kabhi kabhi ```json ke andar wrap karke response bhejta hai, usse clean karte hain
function cleanJson(text) {
  return text.replace(/```json|```/g, '').trim();
}

// Yeh function Gemini ko command bhejta hai aur MCQ questions banwata hai
async function generateTestQuestions({ examCategory, subject, topic, numQuestions, difficulty }) {
  const prompt = `Tum ek expert exam content creator ho ${examCategory} competitive exam ke liye.

Mujhe ${numQuestions} multiple choice questions (MCQs) chahiye is topic pe: "${subject}${topic ? ' - ' + topic : ''}".
Difficulty level: ${difficulty || 'medium'}.

Rules:
- Har question exact ${examCategory} exam pattern jaisa hona chahiye
- Har question ke 4 options hone chahiye
- Sirf ek hi sahi answer ho
- Har question ke saath ek chhota explanation do ki sahi jawab kyu sahi hai
- Numerical questions mein calculation double-check karna, galti nahi honi chahiye
- HAR question, options aur explanation dono English AUR Hindi mein do (jaisa asli SSC/Banking/Railway exams mein bilingual papers hote hain). Hindi translation natural aur exam-appropriate honi chahiye, word-by-word literal nahi.
- Sirf valid JSON return karo, koi extra text nahi, koi markdown formatting nahi (no \`\`\`)

Response EXACTLY is JSON format mein do:
[
  {
    "questionText": "question in English",
    "questionTextHi": "question ka Hindi translation",
    "options": ["option A", "option B", "option C", "option D"],
    "optionsHi": ["option A Hindi", "option B Hindi", "option C Hindi", "option D Hindi"],
    "correctAnswerIndex": 0,
    "explanation": "explanation in English",
    "explanationHi": "explanation ka Hindi translation"
  }
]`;

  const result = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });
  const responseText = result.text;
  const cleanedText = cleanJson(responseText);

  try {
    const questions = JSON.parse(cleanedText);
    return questions;
  } catch (error) {
    throw new Error('AI response ko samajhne mein error aayi, dubara try karo');
  }
}

// Yeh function poora Full-Length Mock Test banata hai (jaise SSC CGL Tier 1: 4 sections,
// har section ka apna alag locked time). Ek hi call mein saare sections ke questions milte hain.
async function generateFullMockTest({ examCategory, subCategory, sections, difficulty }) {
  // sections = [{ name: 'Quantitative Aptitude', numQuestions: 25, durationMinutes: 15 }, ...]
  const sectionsList = sections
    .map((s, i) => `${i + 1}. ${s.name} — ${s.numQuestions} questions`)
    .join('\n');

  const prompt = `Tum ek expert exam content creator ho ${examCategory}${subCategory ? ' ' + subCategory : ''} competitive exam ke liye.

Mujhe ek COMPLETE full-length mock test chahiye, jisme ye sections hon (isi order mein):
${sectionsList}

Difficulty level: ${difficulty || 'medium'}.

Rules:
- Har section ke exact utne hi questions banao jitne bataye gaye hain, sections isi order mein hone chahiye
- Har question exact ${examCategory} exam pattern jaisa hona chahiye, us section ke subject se related
- Har question ke 4 options hone chahiye, sirf ek hi sahi answer ho
- Har question ke saath ek chhota explanation do
- Numerical questions mein calculation double-check karna
- HAR question, options aur explanation dono English AUR Hindi mein do (jaisa asli bilingual exam papers hote hain). Hindi translation natural honi chahiye.
- Sirf valid JSON return karo, koi extra text nahi, koi markdown formatting nahi (no \`\`\`)

Response EXACTLY is JSON format mein do (ek single flat array, sections ke order mein questions):
[
  {
    "questionText": "question in English",
    "questionTextHi": "question ka Hindi translation",
    "options": ["option A", "option B", "option C", "option D"],
    "optionsHi": ["option A Hindi", "option B Hindi", "option C Hindi", "option D Hindi"],
    "correctAnswerIndex": 0,
    "explanation": "explanation in English",
    "explanationHi": "explanation ka Hindi translation",
    "sectionName": "us section ka naam jisse ye question belong karta hai"
  }
]`;

  const result = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });
  const responseText = result.text;
  const cleanedText = cleanJson(responseText);

  try {
    const questions = JSON.parse(cleanedText);
    return questions;
  } catch (error) {
    throw new Error('AI response ko samajhne mein error aayi, dubara try karo');
  }
}

// Yeh function Gemini se detailed study notes (PDF ke liye content) generate karwata hai
async function generateStudyNotes({ examCategory, subject, topic }) {
  const prompt = `Tum ek expert teacher ho ${examCategory} competitive exam preparation ke liye, jinhe pichle 10 saal ka exam pattern pata hai.

Mujhe "${topic}" (${subject} subject ke andar) is topic pe COMPLETE, EXAM-READY study notes chahiye, jo ek professional PDF banane ke liye use honge.

Structure follow karo:
1. Ek chhota intro paragraph (topic kyu important hai exam ke liye)
2. Core concept/theory (clear, simple language mein)
3. Important formulas/rules (agar applicable ho) — bullet points mein
4. Kam se kam 3 solved examples, step-by-step solution ke saath
5. Common mistakes jo students karte hain
6. 5 practice questions (bina answer ke, sirf practice ke liye) end mein

Rules:
- Exam-focused rakho, bahut lamba-chauda generic theory nahi
- Har section clear heading ke saath ho
- Formulas ko clearly highlight karo text mein (jaise "Formula: ...")
- Sirf valid JSON return karo, koi extra text nahi, koi markdown formatting nahi (no \`\`\`)

Response EXACTLY is JSON format mein do:
{
  "title": "Topic ka naam",
  "sections": [
    {
      "heading": "Section ka naam",
      "content": "Section ka detailed content yaha (plain text, paragraphs ke liye \\n\\n use karo, bullet points ke liye \\n- use karo)"
    }
  ]
}`;

  const result = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });
  const responseText = result.text;
  const cleanedText = cleanJson(responseText);

  try {
    const notes = JSON.parse(cleanedText);
    return notes;
  } catch (error) {
    throw new Error('AI response ko samajhne mein error aayi, dubara try karo');
  }
}

// Yeh function user ke doubt/question ka answer deta hai (Flash-Lite - fast aur zyada daily limit)
async function solveDoubt(userQuestion) {
  const prompt = `Tum ek helpful teacher ho jo competitive exam (SSC, Banking, Railway) students ki madad karte ho.

Student ka sawal: "${userQuestion}"

Simple, clear aur exam-focused jawab do. Agar calculation hai to step by step samjhao. Zyada lamba mat likhna, seedha point pe aao.`;

  const result = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });
  return result.text;
}

module.exports = { generateTestQuestions, generateFullMockTest, generateStudyNotes, solveDoubt };
