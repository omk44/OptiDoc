import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    const fetchAppointments = async () => {
      // Only fetch if user is available
      if (!user || !user._id) { // Ensure user and user._id exist
        setAppointments([]); // Clear appointments if no user
        return;
      }

      try {
        let res;
        // Construct the base URL for appointments API
        const baseUrl = "http://localhost:5000/api/appointments";

        if (user.role === "patient") {
          res = await axios.get(`${baseUrl}/patient/${user._id}`);
        } else if (user.role === "doctor") {
          res = await axios.get(`${baseUrl}/doctor/${user._id}`);
        } else if (user.role === "admin") {
          res = await axios.get(baseUrl); // Admin gets all appointments
        }
        
        // Ensure response data is an array before setting state
        if (res && Array.isArray(res.data)) {
          setAppointments(res.data);
        } else {
          setAppointments([]); // Set to empty array if data is not as expected
          console.warn("API response for appointments was not an array:", res.data);
        }

      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointments([]); // Clear appointments on error
      }
    };

    fetchAppointments();
  }, [user]); // Re-run effect when user changes

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
          {appointments.map((app) => ( // Removed index from key as app._id should be unique
            <li
              key={app._id} // Use app._id as key for better performance and uniqueness
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
