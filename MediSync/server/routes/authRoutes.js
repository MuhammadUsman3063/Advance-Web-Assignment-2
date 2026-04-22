const express = require('express');
const router = express.Router();
// createStaff ko import mein add kiya
const { registerUser, loginUser, createStaff } = require('../controllers/authController'); 
// admin middleware ko import kiya
const { protect, admin } = require('../middleware/authMiddleware'); 

// Public Routes (Koi bhi login kar sakta hai)
router.post('/register', registerUser); // (Note: Production mein register API band kar dete hain taake bahar se koi account na bana sake)
router.post('/login', loginUser);

// Secure Admin Route (Sirf Doctor naya staff bana sakta hai)
router.post('/staff', protect, admin, createStaff); 

module.exports = router;