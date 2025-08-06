// src/pages/BookingForm.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
// Assuming this is for local doctor data, but we are now fetching from DB
// import doctors from "../data/doctors"; 
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import axios from "axios"; // Import axios for API calls

export default function BookingForm() {
  const navigate = useNavigate();
  // Get selected doctor from localStorage (assuming it's set when navigating to book)
  // This doctor object now comes from your backend, so it should have fullName and _id
  const doctor = JSON.parse(localStorage.getItem("selectedDoctor"));
  // Get logged-in user from AuthContext
  const { user } = useAuth(); 

  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => { // Made handleSubmit async
    e.preventDefault();

    const now = new Date();
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime < now) {
      alert("❌ Cannot book appointment in the past."); // Consider a custom modal instead of alert()
      return;
    }

    // Ensure user is logged in and is a patient
    if (!user || user.role !== "patient") {
      alert("Only logged-in patients can book appointments."); // Consider a custom modal instead of alert()
      return;
    }

    // Prepare data for the backend API call
    const appointmentData = {
      patientId: user._id, // Use the MongoDB _id of the logged-in patient
      doctorId: doctor._id, // Use the MongoDB _id of the selected doctor
      date: formData.date,
      time: formData.time,
    };

    try {
      // Make POST request to your backend to save the appointment
      const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
      
      if (response.status === 201) { // Check for successful creation status
        // Use doctor.fullName here for consistency
        alert(`✅ Appointment booked with ${doctor.fullName} on ${formData.date} at ${formData.time}`); // Consider a custom modal instead of alert()
        navigate("/appointments");
      } else {
        alert("❌ Failed to book appointment. Please try again."); // Handle other response statuses
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("❌ Server error. Could not book appointment."); // Handle network/server errors
    }
  };

  // Display message if no doctor is selected or user is not logged in
  if (!doctor) {
    return <p className="p-4 text-red-600">No doctor selected for booking.</p>;
  }
  if (!user) {
    return <p className="p-4 text-red-600">Please login to book appointments.</p>;
  }


  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Book Appointment with {doctor.fullName} {/* Use doctor.fullName here */}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-700 font-medium">Booking as: <span className="font-bold text-blue-600">{user?.username}</span></p>

        <div>
          <label className="block mb-1 font-semibold">Date</label>
          <input
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            type="date"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Time</label>
          <input
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            type="time"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}