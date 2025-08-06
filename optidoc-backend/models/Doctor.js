const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  imageUrl: { // <--- NEW FIELD: To store the URL of the doctor's image
    type: String,
    default: 'https://placehold.co/128x128/cccccc/ffffff?text=Doctor' // Optional: A default placeholder image
  },
  role: {
    type: String,
    default: 'doctor',
    enum: ['doctor']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
