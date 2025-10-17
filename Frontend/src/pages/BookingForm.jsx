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
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Doctor Selected</h2>
          <p className="text-gray-600 mb-6">Please select a doctor from the 'All Doctors' page to book an appointment.</p>
          <button
            onClick={() => navigate('/doctors')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login as a patient to book appointments.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Get today's date in YYYY-MM-DD format for min attribute of date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg border-4 border-blue-200">
              <span className="text-4xl font-bold text-blue-700">
                {doctor.fullName.split(' ').map(w => w[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{doctor.fullName}</h1>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold inline-block mb-2">
                {doctor.specialty}
              </div>
              <p className="text-gray-600 mt-2">Book your appointment with this specialist</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Your Appointment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-gray-700">
                Booking as: <span className="font-bold text-blue-700">{user?.username}</span>
              </p>
            </div>

            <div>
              <label htmlFor="date" className="block mb-2 font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Date
              </label>
              <input
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                type="date"
                min={today}
              />
            </div>

            <div>
              <label htmlFor="time" className="block mb-2 font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Time Slot
              </label>
              {loadingSlots ? (
                <div className="flex items-center text-gray-600 p-4 bg-gray-50 rounded-xl">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span>Loading available slots...</span>
                </div>
              ) : slotsError ? (
                <p className="text-red-500 p-4 bg-red-50 rounded-xl">{slotsError}</p>
              ) : (
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100"
                  disabled={!formData.date}
                >
                  <option value="">Choose a time slot</option>
                  {allTimeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const slotDateTime = new Date(`${formData.date}T${slot}`);
                    const now = new Date();
                    const isPast = formData.date === today && slotDateTime < now;

                    return (
                      <option
                        key={slot}
                        value={slot}
                        disabled={isBooked || isPast}
                      >
                        {slot} {isBooked ? "(Booked)" : ""} {isPast ? "(Past)" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
              {!formData.date && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Please select a date first
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl mt-6 font-bold text-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.date || !formData.time || loadingSlots}
            >
              {loadingSlots ? 'Loading...' : 'Confirm Booking →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
