// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'patient', // ✅ Default role
    enum: ['patient']    // ✅ For now, restrict to 'patient' in this model
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
