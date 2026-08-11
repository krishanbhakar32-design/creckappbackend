// Yeh file define karti hai ki register/login ke liye kaunsa URL use hoga
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register); // POST /api/auth/register
router.post('/login', login); // POST /api/auth/login

module.exports = router;
