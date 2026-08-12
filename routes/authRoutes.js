// Yeh file define karti hai ki register/login ke liye kaunsa URL use hoga
const express = require('express');
const router = express.Router();
const { register, login, makeAdmin } = require('../controllers/authController');

router.post('/register', register); // POST /api/auth/register
router.post('/login', login); // POST /api/auth/login

// Ek time ke liye admin banane wala secret route (browser se hit karo)
// Example: /api/auth/make-admin?email=you@example.com&secret=YOUR_ADMIN_SECRET
router.get('/make-admin', makeAdmin);

module.exports = router;
