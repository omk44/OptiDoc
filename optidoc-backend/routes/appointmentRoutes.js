const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// 🔹 Create Appointment
router.post("/book", async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;

  try {
    // Fetch usernames from respective collections
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: "Patient or doctor not found" });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
      patientUsername: patient.username,
      doctorUsername: doctor.username,
      status: "notbooked", // default until payment is added
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Booking failed", error });
  }
});

// 🔹 Get All Appointments (admin only)
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "fullName email role username")
      .populate("doctorId", "fullName specialty role username");
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
      .populate("doctorId", "fullName specialty username")
      .populate("patientId", "fullName email username");
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ error: "Error fetching patient appointments" });
  }
});

// 🔹 Get Appointments by Doctor
router.get("/doctor/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "fullName email username")
      .populate("doctorId", "fullName specialty username");
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({ error: "Error fetching doctor appointments" });
  }
});

// 🔹 Get All Doctors
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors", error });
  }
});

// 🔹 Cancel/Delete Appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Failed to delete appointment", error });
  }
});

module.exports = router;