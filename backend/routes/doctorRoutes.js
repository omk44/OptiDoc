const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const { upload } = require("../middlewares/upload");
const bcrypt = require("bcryptjs");
const { sendEmail, emailTemplates } = require("../utils/emailService");

// 🔹 Get All Doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const mapped = doctors.map(d => ({
      _id: d._id,
      fullName: d.fullName,
      specialty: d.specialty,
      username: d.username,
      email: d.email,
      role: d.role,
      imageUrl: d.image && d.image.data
        ? `/api/doctors/${d._id}/photo`
        : (d.imageUrl || 'https://placehold.co/128x128/cccccc/ffffff?text=Doctor')
    }));
    res.json(mapped);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors", error });
  }
});

// 🔹 Get Top Doctors by number of appointments
router.get('/top', async (req, res) => {
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
      role: d.role,
      appointmentsCount: countById[String(d._id)] || 0,
      imageUrl: d.image && d.image.data
        ? `/api/doctors/${d._id}/photo`
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

// 🔹 Get Doctor Photo
router.get('/:id/photo', async (req, res) => {
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

// 🔹 Create Doctor (Admin only)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { fullName, specialty, email, username, password } = req.body;
    const newDoctor = new Doctor({
      fullName,
      specialty,
      email,
      username,
      password,
    });
    if (req.file) {
      newDoctor.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      newDoctor.imageUrl = undefined;
    }
    await newDoctor.save();

    // Send welcome email with credentials to doctor
    try {
      await sendEmail(
        email,
        'Welcome to OptiDoc - Doctor Account Created',
        emailTemplates.doctorWelcome(fullName, username, password, specialty)
      );
      console.log('Doctor welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send doctor welcome email:', emailError);
    }

    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Failed to add doctor", error: error.message });
  }
});

// 🔹 Update Doctor by ID (Admin only)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const passwordChanged = !!updateData.password;

    // Hash password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

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

    // Send email notification to doctor about profile update
    try {
      await sendEmail(
        updatedDoctor.email,
        'Profile Updated - OptiDoc',
        emailTemplates.doctorProfileUpdated(
          updatedDoctor.fullName,
          updatedDoctor.username,
          updatedDoctor.specialty,
          passwordChanged
        )
      );
      console.log('Doctor profile update email sent to:', updatedDoctor.email);
    } catch (emailError) {
      console.error('Failed to send doctor profile update email:', emailError);
    }

    res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Failed to update doctor", error: error.message });
  }
});

// 🔹 Delete Doctor by ID (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
