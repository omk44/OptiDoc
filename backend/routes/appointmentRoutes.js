const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { sendEmail, emailTemplates } = require("../utils/emailService");
const { createNotification } = require("./notificationRoutes");

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

    // Send confirmation email to patient
    try {
      await sendEmail(
        patient.email,
        'Appointment Confirmed - OptiDoc',
        emailTemplates.appointmentBooked(patient.fullName, doctor.fullName, date, time, doctor.specialty)
      );
      console.log('Appointment confirmation email sent to:', patient.email);
    } catch (emailError) {
      console.error('Failed to send appointment confirmation email:', emailError);
      // Don't fail appointment booking if email fails
    }

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

// 🔹 Delete Appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Update Appointment Status (Admin only)
router.put("/:id/status-admin", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, newDate, newTime, adminId, adminName } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName specialty");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
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

    const patient = await Patient.findById(appointment.patientId._id);
    const doctor = await Doctor.findById(appointment.doctorId._id);

    // Track changes
    const changes = [];
    if (oldStatus !== status) {
      changes.push(`Status: ${oldStatus} → ${status}`);
    }
    if (newDate && oldDate !== newDate) {
      changes.push(`Date: ${oldDate} → ${newDate}`);
    }
    if (newTime && oldTime !== newTime) {
      changes.push(`Time: ${oldTime} → ${newTime}`);
    }

    const changeMessage = changes.length > 0 ? ` Changes: ${changes.join(', ')}` : '';

    // Notify patient
    await createNotification(
      appointment.patientId._id,
      "patient",
      adminId,
      "admin",
      adminName || "Admin",
      appointment._id,
      "appointment_updated",
      "Appointment Updated by Admin",
      `Your appointment has been updated by ${adminName || "Admin"}.${changeMessage}`,
      appointment.date,
      appointment.time
    );

    // Notify doctor
    await createNotification(
      appointment.doctorId._id,
      "doctor",
      adminId,
      "admin",
      adminName || "Admin",
      appointment._id,
      "appointment_updated",
      "Appointment Updated by Admin",
      `Appointment with ${patient.fullName} has been updated by ${adminName || "Admin"}.${changeMessage}`,
      appointment.date,
      appointment.time
    );

    // Send email notifications
    try {
      await sendEmail(
        patient.email,
        'Appointment Status Update - OptiDoc',
        emailTemplates.appointmentStatusChanged(
          patient.fullName,
          doctor.fullName,
          appointment.date,
          appointment.time,
          oldStatus,
          status,
          `Your appointment has been updated by Admin.${changeMessage}`
        )
      );
      console.log('Admin appointment update email sent to patient:', patient.email);
    } catch (emailError) {
      console.error('Failed to send email to patient:', emailError);
    }

    // Return updated appointment
    const updatedAppointmentWithDetails = await Appointment.findById(appointment._id)
      .populate("patientId", "fullName email username")
      .populate("doctorId", "fullName specialty username");
    
    res.json({ message: "Appointment status updated by admin", appointment: updatedAppointmentWithDetails });
  } catch (error) {
    console.error("Error updating appointment status (admin):", error);
    res.status(500).json({ message: "Failed to update appointment status", error: error.message });
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

    // Send email notification to patient about status change
    try {
      await sendEmail(
        patient.email,
        `Appointment Status Update - OptiDoc`,
        emailTemplates.appointmentStatusChanged(
          patient.fullName,
          doctor.fullName,
          appointment.date,
          appointment.time,
          oldStatus,
          status,
          message
        )
      );
      console.log('Appointment status change email sent to:', patient.email);
    } catch (emailError) {
      console.error('Failed to send appointment status change email:', emailError);
      // Don't fail status update if email fails
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

module.exports = router;
