// Yeh file MongoDB database se connection banati hai
const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('your_mongodb')) {
    console.error(
      '❌ MONGO_URI missing or not set. Backend/.env file banao aur usme apna MongoDB Atlas connection string daalo (backend/.env.example dekho).'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI); // .env file se database link uthayega
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // agar database hi connect nahi hua to server band kar do
  }
};

module.exports = connectDB;
