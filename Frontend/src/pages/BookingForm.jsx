// src/pages/BookingForm.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import doctors from "../data/doctors";

export default function BookingForm() {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("selectedDoctor"));
  const user = JSON.parse(localStorage.getItem("loggedInUser")); // get logged-in user

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const now = new Date();
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime < now) {
      alert("❌ Cannot book appointment in the past.");
      return;
    }

    if (!user || user.role !== "patient") {
      alert("Only logged-in patients can book appointments.");
      return;
    }

    const newAppointment = {
      doctor: doctor,
      patientName: user.username, // auto from login
      patientUsername: user.username, // used for filtering
      date: formData.date,
      time: formData.time,
    };

    const existing = JSON.parse(localStorage.getItem("appointments")) || [];
    localStorage.setItem("appointments", JSON.stringify([...existing, newAppointment]));

    alert(`✅ Appointment booked with ${doctor.name} on ${formData.date} at ${formData.time}`);
    navigate("/appointments");
  };

  if (!doctor) return <p className="p-4 text-red-600">Doctor not found.</p>;

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Book Appointment with {doctor.name}
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
