const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const { router: notificationRoutes } = require("./routes/notificationRoutes");

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5175',
    'https://opti-doc.vercel.app',
    'https://opti-doc-n5wb.vercel.app',
    'https://opti-doc-git-main-omk44s-projects.vercel.app',
    'https://opti-1zxxuehzk-omk44s-projects.vercel.app'
  ],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "OptiDoc Backend is running", timestamp: new Date().toISOString() });
});

// Cached MongoDB connection for serverless environments
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("Mongo Error:", err);
    throw err;
  }
};

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/notifications", notificationRoutes);

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel serverless function
module.exports = app;
