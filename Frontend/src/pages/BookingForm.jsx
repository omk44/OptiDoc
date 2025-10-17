// src/pages/BookingForm.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Helper function to generate time slots (e.g., every 30 minutes)
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) { // Loop for hours 0-23
    for (let j = 0; j < 60; j += 30) { // Loop for 00 and 30 minutes
      const hour = String(i).padStart(2, '0');
      const minute = String(j).padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};

const allTimeSlots = generateTimeSlots(); // Generate all possible slots once

export default function BookingForm() {
  const navigate = useNavigate();
  // Changed doctor to a state variable, initialized from localStorage in an effect
  const [doctor, setDoctor] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    date: "",
    time: "", // This will be updated by the dropdown
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // Effect to load doctor from localStorage only once on component mount
  useEffect(() => {
    const storedDoctor = localStorage.getItem("selectedDoctor");
    if (storedDoctor) {
      try {
        setDoctor(JSON.parse(storedDoctor));
      } catch (e) {
        console.error("Failed to parse selectedDoctor from localStorage:", e);
        localStorage.removeItem("selectedDoctor"); // Clear invalid data
      }
    }
  }, []); // Empty dependency array ensures this runs only once

  // Function to fetch booked slots for the selected doctor and date
  const fetchBookedSlots = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) {
      setBookedSlots([]); // Clear if no doctor or date selected
      return;
    }

    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointments/doctor/${doctorId}/date/${date}`
      );
      setBookedSlots(response.data);
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      setSlotsError("Failed to load available slots.");
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []); // Empty dependency array as it only depends on axios and stable setters

  // Effect to fetch booked slots whenever doctor or date changes
  useEffect(() => {
    // Only fetch if doctor is loaded and a date is selected
    if (doctor?._id && formData.date) {
      fetchBookedSlots(doctor._id, formData.date);
    } else {
      setBookedSlots([]); // Clear booked slots if date or doctor is not selected
    }
  }, [doctor, formData.date, fetchBookedSlots]); // Re-run when doctor or date changes

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    
    // Check if selected date/time is in the past
    if (selectedDateTime < now) {
      alert("❌ Cannot book appointment in the past.");
      return;
    }

    // Check if the selected slot is already booked (client-side check, backend will also validate)
    if (bookedSlots.includes(formData.time)) {
      alert("❌ This time slot is already booked. Please choose another.");
      return;
    }

    if (!user || user.role !== "patient") {
      alert("Only logged-in patients can book appointments.");
      return;
    }

    const appointmentData = {
      patientId: user._id,
      doctorId: doctor._id,
      date: formData.date,
      time: formData.time,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
      
      if (response.status === 201) {
        alert(`✅ Appointment booked with ${doctor.fullName} on ${formData.date} at ${formData.time}\n\n📧 A confirmation email has been sent to your registered email address.`);
        navigate("/appointments");
      } else {
        alert(response.data.message || "❌ Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error.response?.data || error.message);
      alert(error.response?.data?.message || "❌ Server error. Could not book appointment.");
    }
  };

  // Display message if no doctor is selected or user is not logged in
  if (!doctor) {
    return <p className="p-4 text-red-600">No doctor selected for booking. Please select a doctor from the 'All Doctors' page.</p>;
  }
  if (!user) {
    return <p className="p-4 text-red-600">Please login as a patient to book appointments.</p>;
  }

  // Get today's date in YYYY-MM-DD format for min attribute of date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Book Appointment with {doctor.fullName}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-700 font-medium">Booking as: <span className="font-bold text-blue-600">{user?.username}</span></p>

        <div>
          <label htmlFor="date" className="block mb-1 font-semibold">Date</label>
          <input
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            type="date"
            min={today} // Prevent selecting past dates
          />
        </div>

        <div>
          <label htmlFor="time" className="block mb-1 font-semibold">Time</label>
          {loadingSlots ? (
            <p className="text-gray-500">Loading available slots...</p>
          ) : slotsError ? (
            <p className="text-red-500">{slotsError}</p>
          ) : (
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
              disabled={!formData.date} // Disable time selection until a date is chosen
            >
              <option value="">Select a time slot</option>
              {allTimeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const slotDateTime = new Date(`${formData.date}T${slot}`);
                const isPast = formData.date === today && slotDateTime < now; // Disable past slots for today

                return (
                  <option
                    key={slot}
                    value={slot}
                    disabled={isBooked || isPast} // Disable if booked or in the past
                    className={isBooked || isPast ? "text-gray-400 bg-gray-100" : ""}
                  >
                    {slot} {isBooked ? "(Booked)" : ""} {isPast ? "(Past)" : ""}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4"
          disabled={!formData.date || !formData.time || loadingSlots} // Disable if date/time not selected or slots loading
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
