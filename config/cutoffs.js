// Yeh file category-wise expected cutoffs store karti hai (reference ke liye).
// NOTE: Real cutoffs saal-dar-saal aur post-wise badalte hain aur SSC/IBPS/RRB
// normalisation ke baad hi final release karte hain. Yeh sirf REFERENCE/EXPECTED
// values hain (2025-26 trend ke basis pe), result page pe "Expected Cutoff" label
// ke saath dikhaye jate hain, guarantee nahi. Admin inhe yahan update kar sakta hai
// jab official cutoff release ho.
const cutoffs = {
  SSC: {
    'SSC CGL Tier 1': {
      maxMarks: 200,
      categories: [
        { label: 'General (UR)', marks: 155 },
        { label: 'OBC', marks: 140 },
        { label: 'EWS', marks: 140 },
        { label: 'SC', marks: 120 },
        { label: 'ST', marks: 115 },
      ],
    },
    'SSC CHSL Tier 1': {
      maxMarks: 200,
      categories: [
        { label: 'General (UR)', marks: 145 },
        { label: 'OBC', marks: 135 },
        { label: 'EWS', marks: 135 },
        { label: 'SC', marks: 115 },
        { label: 'ST', marks: 110 },
      ],
    },
  },
  Banking: {
    'IBPS PO Prelims': {
      maxMarks: 100,
      categories: [
        { label: 'General', marks: 48 },
        { label: 'OBC / EWS', marks: 45 },
        { label: 'SC', marks: 40 },
        { label: 'ST', marks: 35 },
      ],
    },
    'IBPS Clerk Prelims': {
      maxMarks: 100,
      categories: [
        { label: 'General', marks: 45 },
        { label: 'OBC / EWS', marks: 42 },
        { label: 'SC', marks: 37 },
        { label: 'ST', marks: 32 },
      ],
    },
  },
  Railway: {
    'RRB NTPC CBT 1': {
      maxMarks: 100,
      categories: [
        { label: 'General (UR)', marks: 40 },
        { label: 'OBC / EWS', marks: 37 },
        { label: 'SC', marks: 30 },
        { label: 'ST', marks: 25 },
      ],
    },
  },
};

module.exports = cutoffs;
