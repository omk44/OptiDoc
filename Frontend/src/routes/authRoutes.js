// const express = require('express');
// const router = express.Router();
// const Patient = require('../models/patient');

// // Signup route
// // 🔹 Patient Signup
// router.post("/signup", async (req, res) => {
//   const { fullName, email, phone, username, password } = req.body; // ← include `role`

//   try {
//     // Check if already exists
//     const existing = await Patient.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email already exists" });

//     const newPatient = new Patient({
//       fullName,
//       email,
//       phone,
//       username,
//       password,
//       role: role || 'patient' // ← now `role` is defined
//     });

//     await newPatient.save();
//     res.status(201).json({ message: "Signup successful", user: newPatient });
//   } catch (error) {
//     console.log("Signup error:", error);
//     res.status(500).json({ message: "Signup failed", error: error.message });
//   }
// });


// // Login route
// router.post('/login', async (req, res) => {
//   const { username, password, role } = req.body;
//   try {
//     let user;
//     if (role === 'patient') {
//       user = await Patient.findOne({ username, password });
//     } else if (role === 'doctor') {
//       // Later: check Doctor collection
//     } else if (role === 'admin') {
//       // Later: check Admin collection
//     }

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     res.json({ message: 'Login successful', user });
//   } catch (err) {
//     res.status(500).json({ message: 'Login error', error: err.message });
//   }
// });

// module.exports = router;
