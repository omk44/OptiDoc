const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    default: 'admin', // ✅ Default role
    enum: ['admin']    // ✅ For now, restrict to 'patient' in this model
  },
}, {
  timestamps: true
});


module.exports = mongoose.model('Admin', adminSchema);