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
// Retry + top-up logic ke saath, taaki EXACT utne hi questions milein jitne manga tha
// (Gemini kabhi kabhi kam ya zyada questions bana deta hai, isliye count verify karke fix karte hain)
async function generateTestQuestions({ examCategory, subject, topic, numQuestions, difficulty }) {
  const buildPrompt = (count, avoidList = []) => `You are a senior question-setter who has authored official ${examCategory} exam papers and analyzed the last 10 years of ${examCategory} Previous Year Question papers (PYQs).

Generate EXACTLY ${count} multiple choice questions for: "${subject}${topic ? ' - ' + topic : ''}".
Target difficulty: ${difficulty || 'medium'}.

CRITICAL: You MUST return EXACTLY ${count} question objects in the array - not one more, not one less. Count them before responding.

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
${avoidList.length > 0 ? `- Do not repeat these already-used questions: ${avoidList.slice(0, 10).join(' | ')}` : ''}
- Return ONLY valid JSON, no extra text, no markdown formatting (no \`\`\`)

Respond in EXACTLY this JSON format (an array of EXACTLY ${count} items):
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

  const callGemini = async (count, avoidList = []) => {
    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: buildPrompt(count, avoidList),
    });
    const cleanedText = cleanJson(result.text);
    try {
      const parsed = JSON.parse(cleanedText);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  let questions = await callGemini(numQuestions);

  // Agar count match nahi hua, ek retry poori list ke liye
  let attempts = 0;
  while (questions.length !== numQuestions && attempts < 2) {
    attempts++;
    if (questions.length < numQuestions) {
      // Kam questions mile - baaki ke liye top-up call karo (duplicate avoid karne ki koshish ke saath)
      const missing = numQuestions - questions.length;
      const existingTexts = questions.map((q) => q.questionText);
      const topUp = await callGemini(missing, existingTexts);
      questions = [...questions, ...topUp];
    } else {
      // Zyada questions mile - extra trim kar do
      questions = questions.slice(0, numQuestions);
    }
  }

  // Final safety: agar retries ke baad bhi kam hain, jitne hain utne hi bhejo (zyada ho to trim)
  if (questions.length > numQuestions) {
    questions = questions.slice(0, numQuestions);
  }

  return questions;
}

// Yeh function poora Full-Length Mock Test banata hai (jaise SSC CGL Tier 1: 4 sections,
// har section ka apna alag locked time). Ek hi call mein saare sections ke questions milte hain.
async function generateFullMockTest({ examCategory, subCategory, sections, difficulty }) {
  // sections = [{ name: 'Quantitative Aptitude', numQuestions: 25, durationMinutes: 15 }, ...]
  // Har section ko ALAG call se generate karte hain (generateTestQuestions ka hi retry/top-up logic
  // reuse karke) - isse count-mismatch bug nahi aata jo ek hi bade call mein aksar hota tha.
  const allQuestions = [];

  for (const section of sections) {
    const sectionQuestions = await generateTestQuestions({
      examCategory: `${examCategory}${subCategory ? ' ' + subCategory : ''}`,
      subject: section.name,
      topic: '',
      numQuestions: section.numQuestions,
      difficulty,
    });
    // Tag karo taaki baad mein pata chale ye question kis section ka hai
    sectionQuestions.forEach((q) => {
      q.sectionName = section.name;
    });
    allQuestions.push(...sectionQuestions);
  }

  return allQuestions;
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
