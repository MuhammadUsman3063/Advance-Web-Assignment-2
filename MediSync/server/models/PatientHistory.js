const mongoose = require('mongoose');

// Yeh schema purane patients ka record hamesha ke liye save rakhega
const patientHistorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  tokenNumber: { type: Number, required: true },
  status: { type: String, required: true }, // Completed ya Auto-Closed
  originalDate: { type: Date, required: true }, // Kis din aaya tha
  archivedAt: { type: Date, default: Date.now } // Kab archive hua
});

module.exports = mongoose.model('PatientHistory', patientHistorySchema);