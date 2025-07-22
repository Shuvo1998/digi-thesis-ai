// digi-thesis-ai/server/routes/userRoutes.js (formerly authRoutes.js)
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController'); // Using require now

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router; // Using module.exports now