const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  // Optional legacy URL; prefer using `image` Buffer below
  imageUrl: {
    type: String,
    default: 'https://placehold.co/128x128/cccccc/ffffff?text=Doctor'
  },
  // Store image binary in MongoDB
  image: {
    data: Buffer,
    contentType: String
  },
  role: {
    type: String,
    default: 'doctor',
    enum: ['doctor']
  }
}, {
  timestamps: true
});

// Hash password before save if modified
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
