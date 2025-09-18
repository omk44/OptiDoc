const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  patientUsername: {
    type: String,
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  doctorUsername: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  enum: ["booked", "completed", "canceled", "pending", "cleared", "delayed", "rescheduled"], // Add all needed statuses
    default: "notbooked",
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
