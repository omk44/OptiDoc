const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { upload } = require("../middlewares/upload"); // ✅ CommonJS

// 🔹 Create Appointment
router.post("/book", async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;

  try {
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
      status: "booked",
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

// 🔹 Update Appointment by ID
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
    const bookedSlots = await Appointment.find({ doctorId, date }).select("time -_id");
    res.json(bookedSlots.map(slot => slot.time));
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Failed to fetch booked slots", error: error.message });
  }
});

// 🔹 Get All Doctors
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const mapped = doctors.map(d => ({
      _id: d._id,
      fullName: d.fullName,
      specialty: d.specialty,
      username: d.username,
      email: d.email,
      // hospital: d.hospital,
      role: d.role,
      imageUrl: d.image && d.image.data
        ? `/api/appointments/doctors/${d._id}/photo`
        : (d.imageUrl || 'https://placehold.co/128x128/cccccc/ffffff?text=Doctor')
    }));
    res.json(mapped);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors", error });
  }
});

// 🔹 Get Top Doctors by number of appointments
router.get('/doctors/top', async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 3, 1);
    const agg = await Appointment.aggregate([
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    const ids = agg.map(a => a._id).filter(Boolean);
    const doctors = await Doctor.find({ _id: { $in: ids } });
    const countById = Object.fromEntries(agg.map(a => [String(a._id), a.count]));

    const mapped = doctors.map(d => ({
      _id: d._id,
      fullName: d.fullName,
      specialty: d.specialty,
      username: d.username,
      email: d.email,
      // hospital: d.hospital,
      role: d.role,
      appointmentsCount: countById[String(d._id)] || 0,
      imageUrl: d.image && d.image.data
        ? `/api/appointments/doctors/${d._id}/photo`
        : (d.imageUrl || 'https://placehold.co/128x128/cccccc/ffffff?text=Doctor')
    }));

    // Ensure order by count desc
    mapped.sort((a, b) => b.appointmentsCount - a.appointmentsCount);
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    res.status(500).json({ message: 'Failed to fetch top doctors', error: error.message });
  }
});

// 🔹 Create Doctor (with photo)
router.post("/doctors", upload.single("image"), async (req, res) => {
  try {
    const { fullName, specialty, hospital, email, username, password } = req.body;
    const newDoctor = new Doctor({
      fullName,
      specialty,
      email,
      username,
      password,
      // hospital
    });
    if (req.file) {
      newDoctor.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      newDoctor.imageUrl = undefined;
    }
    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Failed to add doctor", error: error.message });
  }
});

// 🔹 Update Doctor by ID (including photo)
router.put("/doctors/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      updateData.imageUrl = undefined;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Failed to update doctor", error: error.message });
  }
});

// 🔹 Serve doctor photo
router.get('/doctors/:id/photo', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('image imageUrl');
    if (!doctor) return res.status(404).send('Not found');
    if (doctor.image && doctor.image.data) {
      res.set('Content-Type', doctor.image.contentType || 'image/jpeg');
      return res.send(doctor.image.data);
    }
    // Fallback: redirect to imageUrl if exists, otherwise 404
    if (doctor.imageUrl) return res.redirect(doctor.imageUrl);
    return res.status(404).send('No image');
  } catch (err) {
    return res.status(500).send('Server error');
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
