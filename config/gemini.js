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
- Sirf valid JSON return karo, koi extra text nahi, koi markdown formatting nahi (no \`\`\`)

Response EXACTLY is JSON format mein do:
[
  {
    "questionText": "question yaha",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswerIndex": 0,
    "explanation": "explanation yaha"
  }
]`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
  const prompt = `Tum ek expert teacher ho ${examCategory} competitive exam preparation ke liye.

Mujhe "${topic}" (${subject} subject ke andar) is topic pe detailed study notes chahiye, jo PDF banane ke liye use honge.

Rules:
- Notes clear headings aur sub-headings mein organize hone chahiye
- Important formulas/rules highlight karo agar applicable ho
- Kam se kam 2-3 solved examples do
- Simple, exam-focused language use karo (bahut lamba-chauda theory nahi, exam ke liye jo zaroori hai wahi)
- Sirf valid JSON return karo, koi extra text nahi, koi markdown formatting nahi (no \`\`\`)

Response EXACTLY is JSON format mein do:
{
  "title": "Topic ka naam",
  "sections": [
    {
      "heading": "Section ka naam",
      "content": "Section ka detailed content yaha (plain text, paragraphs ke liye \\n\\n use karo)"
    }
  ]
}`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });
  return result.text;
}

module.exports = { generateTestQuestions, generateStudyNotes, solveDoubt };
