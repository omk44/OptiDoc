const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");

// 🔹 Patient Signup
router.post("/signup", async (req, res) => {
  const { fullName, email, phone, username, password,role } = req.body;

  try {
    // Check if already exists
    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

     const newPatient = new Patient({
      fullName,
      email,
      phone,
      username,
      password,
      role: role || 'patient'
    });

    await newPatient.save();
    res.status(201).json({ message: "Signup successful", user: newPatient });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
    console.log(error);
  }
});

// 🔹 Login (patient/doctor/admin)
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user;
    if (role === "patient") {
      user = await Patient.findOne({ username, password });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ username, password });
    } else if (role === "admin") {
      user = await Admin.findOne({ username, password });
    }

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

module.exports = router;
