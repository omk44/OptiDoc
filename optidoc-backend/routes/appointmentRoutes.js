const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor"); // Import the Doctor model
const Patient = require("../models/Patient"); // Import the Patient model

// 🔹 Create Appointment
router.post("/book", async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;

  try {
    const appointment = new Appointment({ patientId, doctorId, date, time });
    await appointment.save();
    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error });
  }
});

// 🔹 Get All Appointments (admin only)
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "fullName email role")
      .populate("doctorId", "fullName specialty role");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
});

// 🔹 Get Appointments by Patient
router.get("/patient/:id", async (req, res) => {
  try {
    const patientId = req.params.id;
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "fullName specialty") // Populate doctor details
      .populate("patientId", "fullName email"); // Also populate patient details for consistency
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching patient appointments:", err); // More detailed logging
    res.status(500).json({ error: "Error fetching patient appointments" });
  }
});

// 🔹 Get Appointments by Doctor
router.get("/doctor/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "fullName email") // Populate patient details
      .populate("doctorId", "fullName specialty"); // Also populate doctor details for consistency
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err); // More detailed logging
    res.status(500).json({ error: "Error fetching doctor appointments" });
  }
});

// 🔹 Get All Doctors (for frontend display)
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({}); // Fetch all doctors
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error); // More detailed logging
    res.status(500).json({ message: "Failed to fetch doctors", error });
  }
});

// 🔹 Cancel/Delete Appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (error) {
    console.error("Error deleting appointment:", error); // More detailed logging
    res.status(500).json({ message: "Failed to delete appointment", error });
  }
});

module.exports = router;