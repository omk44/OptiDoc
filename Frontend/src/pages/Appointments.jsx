// src/pages/Appointments.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("appointments")) || [];

    let visibleAppointments = stored;
    if (user?.role === "patient") {
      visibleAppointments = stored.filter(app => app.patientUsername === user.username);
    }

    setAppointments(visibleAppointments);
  }, []);

  if (!user) {
    return <p className="p-4 text-red-600">Please login to view appointments.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((app, index) => (
            <li
              key={index}
              className="border p-4 rounded shadow-md bg-white"
            >
              <p><strong>Doctor:</strong> {app.doctor?.name || app.doctorName}</p>
              <p><strong>Patient:</strong> {app.patientName}</p>
              <p><strong>Date:</strong> {app.date}</p>
              <p><strong>Time:</strong> {app.time}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
