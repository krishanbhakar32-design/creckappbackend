// Yeh file real, official exam patterns store karti hai (verified against multiple sources,
// 2026 ke latest notification ke hisaab se, as of Aug 2026).
// Admin panel isse use karta hai taaki full-mock test banate waqt sections, questions-per-section,
// per-section timing aur marking scheme sab automatically sahi bharen — kisi cheez ko haath se
// galat na likhna pade.
//
// Fields per pattern:
//   sections: [{ name, numQuestions, durationMinutes }] - agar section ka apna alag marking ho
//             (jaise SSC MTS Session 1 = no negative), to us section object mein khud
//             correctMarks/negativeMarks bhi de sakte hain jo top-level ko override karega.
//   correctMarks / negativeMarks: default marking jab tak section apna override na de
//   note: kisi bhi exam-specific important quirk (jaise "no sectional timing") yahin likha hai

const examPatterns = {
  SSC: {
    'SSC CGL Tier 1': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 25, durationMinutes: 15 },
        { name: 'General Awareness', numQuestions: 25, durationMinutes: 15 },
        { name: 'Quantitative Aptitude', numQuestions: 25, durationMinutes: 15 },
        { name: 'English Comprehension', numQuestions: 25, durationMinutes: 15 },
      ],
      correctMarks: 2,
      negativeMarks: 0.5,
      note: 'Sectional timing: 15 min locked per section. Tier 1 is qualifying only.',
    },
    'SSC CHSL Tier 1': {
      sections: [
        { name: 'General Intelligence', numQuestions: 25, durationMinutes: 15 },
        { name: 'General Awareness', numQuestions: 25, durationMinutes: 15 },
        { name: 'Quantitative Aptitude', numQuestions: 25, durationMinutes: 15 },
        { name: 'English Language', numQuestions: 25, durationMinutes: 15 },
      ],
      correctMarks: 2,
      negativeMarks: 0.5,
      note: 'Sectional timing: 15 min locked per section. Tier 1 is qualifying only.',
    },
    'SSC MTS': {
      sections: [
        {
          name: 'Numerical & Mathematical Ability',
          numQuestions: 20,
          durationMinutes: 22.5,
          correctMarks: 3,
          negativeMarks: 0,
        },
        {
          name: 'Reasoning Ability & Problem Solving',
          numQuestions: 20,
          durationMinutes: 22.5,
          correctMarks: 3,
          negativeMarks: 0,
        },
        {
          name: 'General Awareness',
          numQuestions: 25,
          durationMinutes: 22.5,
          correctMarks: 3,
          negativeMarks: 1,
        },
        {
          name: 'English Language & Comprehension',
          numQuestions: 25,
          durationMinutes: 22.5,
          correctMarks: 3,
          negativeMarks: 1,
        },
      ],
      correctMarks: 3,
      negativeMarks: 0.5, // fallback average; actual is per-section (see above)
      note: 'Session 1 (Maths+Reasoning): NO negative marking. Session 2 (GA+English): -1 per wrong answer. Both sessions compulsory.',
    },
    'SSC GD Constable': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 20, durationMinutes: 60 },
        { name: 'General Knowledge & Awareness', numQuestions: 20, durationMinutes: 60 },
        { name: 'Elementary Mathematics', numQuestions: 20, durationMinutes: 60 },
        { name: 'English/Hindi', numQuestions: 20, durationMinutes: 60 },
      ],
      correctMarks: 2,
      negativeMarks: 0.25,
      note: 'No sectional timing - full 60 minutes for all 4 sections combined. Followed by PET/PST (qualifying, not scored).',
    },
    'SSC CPO Paper 1': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 50, durationMinutes: 30 },
        { name: 'General Knowledge & Awareness', numQuestions: 50, durationMinutes: 30 },
        { name: 'Quantitative Aptitude', numQuestions: 50, durationMinutes: 30 },
        { name: 'English Comprehension', numQuestions: 50, durationMinutes: 30 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
      note: 'Sectional timing: 30 min locked per section. For Delhi Police/CAPF Sub-Inspector. Paper 2 (English only, after PET/PST) not included here.',
    },
    'SSC Stenographer': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 50, durationMinutes: 30 },
        { name: 'General Awareness', numQuestions: 50, durationMinutes: 30 },
        { name: 'English Language & Comprehension', numQuestions: 100, durationMinutes: 60 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
      note: 'Followed by a qualifying shorthand/typing skill test (not an MCQ stage).',
    },
    'SSC JE Paper 1': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 50, durationMinutes: 40 },
        { name: 'General Awareness', numQuestions: 50, durationMinutes: 40 },
        { name: 'General Engineering (Civil/Electrical/Mechanical)', numQuestions: 100, durationMinutes: 40 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
      note: 'No official sectional timing found; total paper duration is 120 min. Paper 2 (technical, discipline-specific, 300 marks, -1 per wrong) not included here.',
    },
    'SSC Selection Post': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 25, durationMinutes: 15 },
        { name: 'General Awareness', numQuestions: 25, durationMinutes: 15 },
        { name: 'Quantitative Aptitude', numQuestions: 25, durationMinutes: 15 },
        { name: 'English Language', numQuestions: 25, durationMinutes: 15 },
      ],
      correctMarks: 2,
      negativeMarks: 0.5,
      note: 'Single-stage exam (no Tier 2). Conducted separately for Matric/12th/Graduate levels - same pattern, difficulty varies by level.',
    },
    'Delhi Police Constable': {
      sections: [
        { name: 'Reasoning', numQuestions: 25, durationMinutes: 90 },
        { name: 'General Awareness', numQuestions: 50, durationMinutes: 90 },
        { name: 'Quantitative Aptitude', numQuestions: 15, durationMinutes: 90 },
        { name: 'Computer Awareness', numQuestions: 10, durationMinutes: 90 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
      note: 'No sectional timing - full 90 minutes for all sections combined. General Awareness carries the highest weightage.',
    },
  },
  IBPS: {
    'IBPS PO Prelims': {
      sections: [
        { name: 'English Language', numQuestions: 30, durationMinutes: 20 },
        { name: 'Quantitative Aptitude', numQuestions: 35, durationMinutes: 20 },
        { name: 'Reasoning Ability', numQuestions: 35, durationMinutes: 20 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
    },
    'IBPS Clerk Prelims': {
      sections: [
        { name: 'English Language', numQuestions: 30, durationMinutes: 20 },
        { name: 'Quantitative Aptitude', numQuestions: 35, durationMinutes: 20 },
        { name: 'Reasoning Ability', numQuestions: 35, durationMinutes: 20 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
    },
    'SBI PO Prelims': {
      sections: [
        { name: 'English Language', numQuestions: 30, durationMinutes: 20 },
        { name: 'Quantitative Aptitude', numQuestions: 35, durationMinutes: 20 },
        { name: 'Reasoning Ability', numQuestions: 35, durationMinutes: 20 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
    },
  },
  RRB: {
    'RRB NTPC CBT 1': {
      sections: [
        { name: 'Mathematics', numQuestions: 30, durationMinutes: 30 },
        { name: 'General Intelligence & Reasoning', numQuestions: 30, durationMinutes: 30 },
        { name: 'General Awareness', numQuestions: 40, durationMinutes: 30 },
      ],
      correctMarks: 1,
      negativeMarks: 0.33,
    },
    'RRB Group D': {
      sections: [
        { name: 'Mathematics', numQuestions: 25, durationMinutes: 22.5 },
        { name: 'General Intelligence & Reasoning', numQuestions: 30, durationMinutes: 22.5 },
        { name: 'General Science', numQuestions: 25, durationMinutes: 22.5 },
        { name: 'General Awareness & Current Affairs', numQuestions: 20, durationMinutes: 22.5 },
      ],
      correctMarks: 1,
      negativeMarks: 0.33,
    },
  },
};

module.exports = examPatterns;
