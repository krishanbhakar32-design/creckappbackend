// Yeh backend ka main entry point hai - yahi se poora server start hota hai
require('dotenv').config(); // .env file se secret keys load karta hai
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware setup
// Frontend (Vercel) se requests allow karne ke liye CORS setup
// FRONTEND_URL env var mein apna live frontend URL daalo (jaise https://mockpulse.vercel.app)
// Comma se multiple URLs bhi daal sakte ho (local dev + live dono)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman jaise tools ya server-to-server calls mein origin nahi hota, unhe allow kar do
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log('❌ CORS blocked origin:', origin, '| Allowed:', allowedOrigins);
      return callback(new Error('CORS policy: is origin ko allow nahi kiya gaya'));
    },
    credentials: true,
  })
);
app.use(express.json()); // JSON data samajhne ke liye

// Database se connect karo
connectDB();

// Test route - yeh check karne ke liye ki server chal raha hai
app.get('/', (req, res) => {
  res.send('CrackPrep backend is running ✅');
});

// Uploaded PDFs ko direct link se accessible banate hain (download/view ke liye)
app.use('/uploads', express.static('uploads'));

// Sab API routes connect karte hain
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/pdfs', require('./routes/pdfRoutes'));
app.use('/api/doubt', require('./routes/doubtRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/discussion', require('./routes/discussionRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
