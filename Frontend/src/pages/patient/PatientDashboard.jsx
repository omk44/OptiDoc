// src/pages/patient/PatientDashboard.jsx
import { useEffect, useState } from "react";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("appointments")) || [];
    const patientName = localStorage.getItem("userName");
    const filtered = stored.filter(appt => appt.patientName === patientName);
    setAppointments(filtered);
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-12 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Patient Dashboard</h2>
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments booked yet.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appt, idx) => (
            <li key={idx} className="p-4 bg-white rounded shadow">
              <p><strong>Doctor:</strong> {appt.doctorName}</p>
              <p><strong>Date:</strong> {appt.date}</p>
              <p><strong>Time:</strong> {appt.time}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
