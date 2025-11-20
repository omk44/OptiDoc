const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  recipientRole: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  senderRole: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  type: {
    type: String,
    enum: ["appointment_booked", "appointment_cleared", "appointment_delayed", "appointment_canceled", "appointment_rescheduled", "appointment_updated"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  appointmentDate: {
    type: String,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Notification", notificationSchema);
