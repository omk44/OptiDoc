const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// 🔹 Create Appointment
router.post("/book", async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;

  try {
    // Check for existing appointment at the same time for the same doctor
    const existingAppointment = await Appointment.findOne({ doctorId, date, time });
    if (existingAppointment) {
      return res.status(409).json({ message: "This time slot is already booked for this doctor." });
    }

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
      status: "booked", // Default status to 'booked' upon successful booking
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Booking failed", error: error.message });
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

// 🔹 Update Appointment by ID (NEW)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment updated", appointment: updatedAppointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Failed to update appointment", error: error.message });
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

// 🔹 Get Booked Slots for a Doctor on a Specific Date
router.get("/doctor/:doctorId/date/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const bookedSlots = await Appointment.find({ doctorId, date }).select('time -_id'); // Select only the time field
    res.json(bookedSlots.map(slot => slot.time)); // Return an array of booked times
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Failed to fetch booked slots", error: error.message });
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

// 🔹 Create Doctor (NEW)
router.post("/doctors", async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Failed to add doctor", error: error.message });
  }
});

// 🔹 Update Doctor by ID (NEW)
router.put("/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Failed to update doctor", error: error.message });
  }
});

// 🔹 Delete Appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Delete Doctor by ID
router.delete("/doctors/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
