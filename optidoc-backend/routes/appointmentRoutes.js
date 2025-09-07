const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Notification = require("../models/Notification");
const { upload } = require("../middlewares/upload"); // ✅ CommonJS

// Helper function to create notifications
const createNotification = async (recipientId, recipientRole, senderId, senderRole, senderName, appointmentId, type, title, message, appointmentDate, appointmentTime) => {
  try {
    const notification = new Notification({
      recipientId,
      recipientRole,
      senderId,
      senderRole,
      senderName,
      appointmentId,
      type,
      title,
      message,
      appointmentDate,
      appointmentTime,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

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

    // Create notification for doctor
    await createNotification(
      doctorId,
      "doctor",
      patientId,
      "patient",
      patient.fullName,
      appointment._id,
      "appointment_booked",
      "New Appointment Booked",
      `${patient.fullName} has booked an appointment with you on ${date} at ${time}`,
      date,
      time
    );

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

// 🔹 Update Appointment by ID (Admin only)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, updatedByRole } = req.body;
    
    // Get the original appointment
    const originalAppointment = await Appointment.findById(id)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName specialty");
    
    if (!originalAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true })
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName specialty");

    // Create notifications for appointment changes by admin
    if (updatedBy && updatedByRole === 'admin') {
      const changes = [];
      
      // Check what changed
      if (originalAppointment.date !== updatedAppointment.date) {
        changes.push(`Date: ${originalAppointment.date} → ${updatedAppointment.date}`);
      }
      if (originalAppointment.time !== updatedAppointment.time) {
        changes.push(`Time: ${originalAppointment.time} → ${updatedAppointment.time}`);
      }
      if (originalAppointment.status !== updatedAppointment.status) {
        changes.push(`Status: ${originalAppointment.status} → ${updatedAppointment.status}`);
      }

      if (changes.length > 0) {
        const changeMessage = changes.join(', ');
        
        // Notify patient
        await createNotification(
          updatedAppointment.patientId._id,
          "patient",
          updatedBy,
          "admin",
          "Admin",
          updatedAppointment._id,
          "appointment_updated",
          "Appointment Updated by Admin",
          `Your appointment has been updated by Admin: ${changeMessage}`,
          updatedAppointment.date,
          updatedAppointment.time
        );

        // Notify doctor
        await createNotification(
          updatedAppointment.doctorId._id,
          "doctor",
          updatedBy,
          "admin",
          "Admin",
          updatedAppointment._id,
          "appointment_updated",
          "Appointment Updated by Admin",
          `Appointment with ${updatedAppointment.patientId.fullName} has been updated by Admin: ${changeMessage}`,
          updatedAppointment.date,
          updatedAppointment.time
        );
      }
    }

    // Return updated appointment with populated data
    const finalUpdatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate("patientId", "fullName email username")
      .populate("doctorId", "fullName specialty username");
    
    res.json({ message: "Appointment updated", appointment: finalUpdatedAppointment });
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

// 🔹 Update Appointment Status (Doctor only)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, newDate, newTime, doctorId } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName specialty");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify doctor owns this appointment
    if (appointment.doctorId._id.toString() !== doctorId) {
      return res.status(403).json({ message: "Unauthorized to update this appointment" });
    }

    const oldStatus = appointment.status;
    const oldDate = appointment.date;
    const oldTime = appointment.time;

    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (newDate) appointment.date = newDate;
    if (newTime) appointment.time = newTime;

    await appointment.save();

    // Create notifications based on status change
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(appointment.patientId._id);

    let notificationType, title, message;
    const changes = [];

    // Track what changed
    if (oldStatus !== status) {
      changes.push(`Status: ${oldStatus} → ${status}`);
    }
    if (newDate && oldDate !== newDate) {
      changes.push(`Date: ${oldDate} → ${newDate}`);
    }
    if (newTime && oldTime !== newTime) {
      changes.push(`Time: ${oldTime} → ${newTime}`);
    }

    const changeMessage = changes.length > 0 ? ` (${changes.join(', ')})` : '';

    switch (status) {
      case "cleared":
        notificationType = "appointment_cleared";
        title = "Appointment Completed";
        message = `Dr. ${doctor.fullName} has marked your appointment as completed${changeMessage}`;
        break;
      case "delayed":
        notificationType = "appointment_delayed";
        title = "Appointment Rescheduled";
        message = `Dr. ${doctor.fullName} has rescheduled your appointment${changeMessage}`;
        break;
      case "canceled":
        notificationType = "appointment_canceled";
        title = "Appointment Canceled";
        message = `Dr. ${doctor.fullName} has canceled your appointment${changeMessage}`;
        break;
      default:
        notificationType = "appointment_rescheduled";
        title = "Appointment Updated";
        message = `Dr. ${doctor.fullName} has updated your appointment${changeMessage}`;
    }

    // Notify patient
    await createNotification(
      appointment.patientId._id,
      "patient",
      doctorId,
      "doctor",
      doctor.fullName,
      appointment._id,
      notificationType,
      title,
      message,
      appointment.date,
      appointment.time
    );

    // Notify admin
    const admin = await require("../models/Admin").findOne();
    if (admin) {
      await createNotification(
        admin._id,
        "admin",
        doctorId,
        "doctor",
        doctor.fullName,
        appointment._id,
        notificationType,
        `Doctor Action: ${title}`,
        `Dr. ${doctor.fullName} updated appointment with ${patient.fullName}${changeMessage}`,
        appointment.date,
        appointment.time
      );
    }

    // Return updated appointment with populated data
    const updatedAppointmentWithDetails = await Appointment.findById(appointment._id)
      .populate("patientId", "fullName email username")
      .populate("doctorId", "fullName specialty username");
    
    res.json({ message: "Appointment status updated", appointment: updatedAppointmentWithDetails });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Failed to update appointment status", error: error.message });
  }
});

// 🔹 Get Notifications for User
router.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const notifications = await Notification.find({ 
      recipientId: userId, 
      recipientRole: role 
    })
    .populate("appointmentId")
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
});

// 🔹 Mark Notification as Read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read", error: error.message });
  }
});

// 🔹 Mark All Notifications as Read
router.put("/notifications/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    await Notification.updateMany(
      { recipientId: userId, recipientRole: role, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read", error: error.message });
  }
});

module.exports = router;
