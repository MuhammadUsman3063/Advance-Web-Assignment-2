const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed'], // Pending = Waiting room, Active = Doctor room, Completed = Done
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);