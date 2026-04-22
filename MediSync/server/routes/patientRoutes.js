const express = require('express');
const router = express.Router();
// getPatientHistory ko import mein add karo
const { registerPatient, getPatients, deletePatient, callNextPatient, getPatientHistory } = require('../controllers/patientController'); 
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerPatient);
router.get('/', protect, getPatients); 
router.put('/next', protect, callNextPatient); 

// NAYA ROUTE: History mangwane ke liye (Isko delete route se oopar rakhna hai)
router.get('/history', protect, getPatientHistory); 

router.delete('/:id', protect, deletePatient); 

module.exports = router;