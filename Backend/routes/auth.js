// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Sign Up Route
router.post('/signup', authController.registerUser);

// Sign In Route
router.post('/login', authController.loginUser);

module.exports = router;
