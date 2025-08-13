import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
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

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    if (search.trim()) {
      filtered = filtered.filter(app =>
        (app.doctorId?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
        (app.patientId?.fullName || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      const timeA = new Date(`${a.date} ${a.time}`);
      const timeB = new Date(`${b.date} ${b.time}`);
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [appointments, search, sortOrder]);

  if (!user)
    return <p className="p-4 text-red-600">Please login to view appointments.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by doctor or patient name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2 md:mb-0 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Sort by Date: {sortOrder === "asc" ? "Oldest" : "Newest"}
        </button>
      </div>
      {filteredAppointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredAppointments.map((app) => (
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
