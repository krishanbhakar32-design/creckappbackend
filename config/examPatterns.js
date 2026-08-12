// Yeh file real, official exam patterns store karti hai (2026 ke latest notification ke hisaab se).
// Admin panel isse use karta hai taaki full-mock test banate waqt sections, questions-per-section,
// per-section timing aur marking scheme sab automatically sahi bharen — kisi cheez ko haath se
// galat na likhna pade.
//
// Marking: correctMarks = sahi jawab ke marks, negativeMarks = galat jawab pe kitna katega (positive number likha hai, minus khud lagta hai)

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
    },
    'SSC MTS': {
      sections: [
        { name: 'General Intelligence & Reasoning', numQuestions: 20, durationMinutes: 15 },
        { name: 'Numerical & Mathematical Ability', numQuestions: 20, durationMinutes: 15 },
        { name: 'General Awareness', numQuestions: 20, durationMinutes: 15 },
        { name: 'English Language', numQuestions: 20, durationMinutes: 15 },
      ],
      correctMarks: 1,
      negativeMarks: 0.25,
    },
  },
  Banking: {
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
  Railway: {
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
