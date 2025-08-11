import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user._id) return setAppointments([]);

    const fetchAppointments = async () => {
      try {
        const baseUrl = "http://localhost:5000/api/appointments";
        let res;
        
        if (user.role === "patient")
          res = await axios.get(`${baseUrl}/patient/${user._id}`);
        else if (user.role === "doctor")
          res = await axios.get(`${baseUrl}/doctor/${user._id}`);
        else if (user.role === "admin")
          res = await axios.get(baseUrl);

        const sorted = (res.data || []).sort((a, b) => {
          const timeA = new Date(`${a.date} ${a.time}`);
          const timeB = new Date(`${b.date} ${b.time}`);
          return timeA - timeB;
        });

        setAppointments(sorted);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, [user]);

  if (!user)
    return <p className="p-4 text-red-600">Please login to view appointments.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((app) => (
            <li
              key={app._id}
              className="border p-4 rounded shadow-md bg-white"
            >
              <p><strong>Doctor:</strong> {app.doctorId?.fullName || 'N/A'}</p>
              <p><strong>Patient:</strong> {app.patientId?.fullName || 'N/A'}</p>
              <p><strong>Date:</strong> {app.date}</p>
              <p><strong>Time:</strong> {app.time}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
