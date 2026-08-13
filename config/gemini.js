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
  const prompt = `You are a senior question-setter who has authored official ${examCategory} exam papers and analyzed the last 10 years of ${examCategory} Previous Year Question papers (PYQs).

Generate ${numQuestions} multiple choice questions for: "${subject}${topic ? ' - ' + topic : ''}".
Target difficulty: ${difficulty || 'medium'}.

CRITICAL ACCURACY RULES (follow strictly):
- Base every question on the actual style, phrasing and difficulty seen in real ${examCategory} PYQs from the last 10 years. Do not invent trivial or off-syllabus questions.
- Before writing correctAnswerIndex, mentally SOLVE the question step by step yourself, exactly as it would be solved in the official answer key, and double, triple check the arithmetic/logic. The correctAnswerIndex MUST match your own worked solution, not a guess.
- For numerical/quant questions: show correct calculation logic in your head first, verify the final number is exactly one of the 4 options, THEN write the question.
- Difficulty must be genuinely ${difficulty || 'medium'}:
  - "easy" = a below-average PYQ-level question, still exam-standard, not a trivial school-level question.
  - "medium" = a typical PYQ-level question of average difficulty for ${examCategory}.
  - "hard" = a PYQ-level question from the tougher end of the paper (multi-step, tricky distractors), the kind that only strong candidates solve confidently within the per-question time limit.
- Distractor options (wrong answers) must be plausible "common mistake" values, not random or obviously wrong.
- Every question needs exactly 4 options and exactly one correct answer.
- Include a short explanation showing the correct solution method.
- Give EVERY question, its options and explanation in BOTH English AND Hindi (like real bilingual SSC/Banking/Railway papers). Hindi must be natural and exam-appropriate, not a literal word-by-word translation.
- Return ONLY valid JSON, no extra text, no markdown formatting (no \`\`\`)

Respond in EXACTLY this JSON format:
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

  const prompt = `You are a senior question-setter who has authored official ${examCategory}${subCategory ? ' ' + subCategory : ''} exam papers and analyzed the last 10 years of ${examCategory} Previous Year Question papers (PYQs).

Generate a COMPLETE full-length mock test with these sections (in this exact order):
${sectionsList}

Target difficulty: ${difficulty || 'medium'}.

CRITICAL ACCURACY RULES (follow strictly):
- Generate exactly the stated number of questions per section, in the given order.
- Base every question on the actual style, phrasing and difficulty seen in real ${examCategory}${subCategory ? ' ' + subCategory : ''} PYQs from the last 10 years, matching that section's subject.
- Before writing correctAnswerIndex, mentally SOLVE the question step by step yourself, exactly as it would be solved in the official answer key, and double, triple check the arithmetic/logic. The correctAnswerIndex MUST match your own worked solution, not a guess.
- For numerical/quant questions: verify your calculated answer is exactly one of the 4 options before finalizing the question.
- Difficulty must be genuinely ${difficulty || 'medium'} — a real PYQ-level question for ${examCategory}, not a simplified or trivial version. "hard" means the tough end of the real paper (multi-step, tricky distractors).
- Distractor options must be plausible "common mistake" values, not random or obviously wrong.
- Include a short explanation showing the correct solution method.
- Give EVERY question, its options and explanation in BOTH English AND Hindi (like real bilingual exam papers). Hindi must be natural and exam-appropriate, not literal word-by-word translation.
- Return ONLY valid JSON, no extra text, no markdown formatting (no \`\`\`)

Respond in EXACTLY this JSON format (a single flat array, questions in section order):
[
  {
    "questionText": "question in English",
    "questionTextHi": "question ka Hindi translation",
    "options": ["option A", "option B", "option C", "option D"],
    "optionsHi": ["option A Hindi", "option B Hindi", "option C Hindi", "option D Hindi"],
    "correctAnswerIndex": 0,
    "explanation": "explanation in English",
    "explanationHi": "explanation ka Hindi translation",
    "sectionName": "the section name this question belongs to"
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
async function generateStudyNotes({ examCategory, subject, topic, customPrompt }) {
  // Agar admin ne apna khud ka prompt diya hai, to uska content-instruction seedha use karo -
  // koi forced intro/structure nahi thopte, admin jo maange wahi banega.
  const contentInstruction = customPrompt
    ? customPrompt
    : `Create COMPLETE, EXAM-READY study notes on "${topic}" (${subject} subject) for ${examCategory} exam preparation. Include: core concept/theory, important formulas/rules, at least 3 solved examples with step-by-step solutions, common mistakes students make, and 5 practice questions (without answers) at the end.`;

  const prompt = `You are an expert ${examCategory} exam content writer preparing a PDF study document.

Topic: "${topic}" (Subject: ${subject})

What to create:
${contentInstruction}

Formatting rules:
- Organize the content into clearly headed sections
- Highlight formulas clearly in the text (e.g. "Formula: ...")
- Return ONLY valid JSON, no extra text, no markdown formatting (no \`\`\`)

Respond in EXACTLY this JSON format:
{
  "title": "A short title for this document",
  "sections": [
    {
      "heading": "Section name",
      "content": "Section's detailed content here (plain text, use \\n\\n for paragraphs, \\n- for bullet points)"
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
