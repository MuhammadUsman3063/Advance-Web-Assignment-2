const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ek email se ek hi account banega
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Receptionist', 'Doctor', 'Admin'], // Sirf ye 3 roles allow hain
    default: 'Receptionist',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);