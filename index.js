// Yeh backend ka main entry point hai - yahi se poora server start hota hai
require('dotenv').config(); // .env file se secret keys load karta hai
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware setup
app.use(cors()); // frontend se requests aane dega (alag domain se bhi)
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
