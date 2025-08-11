import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../components/Footer";

// Helper function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = String(i).padStart(2, '0');
      const minute = String(j).padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};
const allTimeSlots = generateTimeSlots();

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Add Doctor Form
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
  const [newDoctorData, setNewDoctorData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    specialty: '',
    imageUrl: ''
  });

  // State for Edit Doctor Modal
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editDoctorFormData, setEditDoctorFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    specialty: '',
    imageUrl: ''
  });

  // State for Edit Appointment Modal
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editAppointmentFormData, setEditAppointmentFormData] = useState({
    date: '',
    time: '',
    status: ''
  });

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [apptRes, docRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/appointments/doctors"),
      ]);

      // Sort appointments by date (newest first)
      const sortedAppointments = apptRes.data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });

      setAppointments(sortedAppointments);
      setDoctors(docRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data for Admin Dashboard:", err);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  // --- Doctor CRUD Operations ---

  const handleNewDoctorChange = (e) => {
    setNewDoctorData({ ...newDoctorData, [e.target.name]: e.target.value });
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!newDoctorData.fullName || !newDoctorData.username || !newDoctorData.email || !newDoctorData.password || !newDoctorData.specialty) {
        alert("Please fill all required fields for the new doctor.");
        return;
      }
      const response = await api.post("/appointments/doctors", newDoctorData);
      alert(response.data.message);
      setNewDoctorData({ fullName: '', username: '', email: '', password: '', specialty: '', imageUrl: '' });
      setShowAddDoctorForm(false);
      fetchData();
    } catch (error) {
      console.error("Error adding doctor:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add doctor.");
    }
  };

  const startEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setEditDoctorFormData({
      fullName: doctor.fullName,
      username: doctor.username,
      email: doctor.email,
      specialty: doctor.specialty,
      imageUrl: doctor.imageUrl || ''
    });
  };

  const handleEditDoctorChange = (e) => {
    setEditDoctorFormData({ ...editDoctorFormData, [e.target.name]: e.target.value });
  };

  const handleEditDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editDoctorFormData.fullName || !editDoctorFormData.username || !editDoctorFormData.email || !editDoctorFormData.specialty) {
        alert("Please fill all required fields for doctor details.");
        return;
      }
      const response = await api.put(`/appointments/doctors/${editingDoctor._id}`, editDoctorFormData);
      alert(response.data.message);
      setEditingDoctor(null);
      fetchData();
    } catch (error) {
      console.error("Error updating doctor:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to update doctor.");
    }
  };

  const deleteDoctor = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this doctor? This will also remove associated appointments.")) {
        await api.delete(`/appointments/doctors/${id}`);
        alert("Doctor deleted successfully.");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor.");
    }
  };

  // --- Appointment CRUD Operations ---

  const startEditAppointment = async (appointment) => {
    setEditingAppointment(appointment);
    setEditAppointmentFormData({
      date: appointment.date,
      time: appointment.time,
      status: appointment.status
    });
  };

  const handleEditAppointmentChange = (e) => {
    setEditAppointmentFormData({ ...editAppointmentFormData, [e.target.name]: e.target.value });
  };

  const handleEditAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/appointments/${editingAppointment._id}`, editAppointmentFormData);
      alert(response.data.message);
      setEditingAppointment(null);
      fetchData();
    } catch (error) {
      console.error("Error updating appointment:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to update appointment.");
    }
  };

  const deleteAppointment = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this appointment?")) {
        await api.delete(`/appointments/${id}`);
        alert("Appointment deleted successfully.");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center text-blue-600">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Admin Info and Logout */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-800">OptiDoc Admin Dashboard</h1>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Welcome, {user?.fullName || user?.username || 'Admin'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-600 text-sm">
                Logged in as: <span className="font-semibold text-blue-600">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Add Doctor Section */}
        <section className="mb-12 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Manage Doctors</h2>
          <button
            onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mb-4"
          >
            {showAddDoctorForm ? "Hide Add Doctor Form" : "Add New Doctor"}
          </button>

          {showAddDoctorForm && (
            <form onSubmit={handleAddDoctorSubmit} className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">Add Doctor</h3>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={newDoctorData.fullName}
                onChange={handleNewDoctorChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newDoctorData.username}
                onChange={handleNewDoctorChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newDoctorData.email}
                onChange={handleNewDoctorChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newDoctorData.password}
                onChange={handleNewDoctorChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="specialty"
                placeholder="Specialty"
                value={newDoctorData.specialty}
                onChange={handleNewDoctorChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="imageUrl"
                placeholder="Image URL (optional)"
                value={newDoctorData.imageUrl}
                onChange={handleNewDoctorChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Add Doctor
              </button>
            </form>
          )}
        </section>

        {/* All Doctors Table */}
        <section className="mb-12 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">All Doctors</h2>
          {doctors.length === 0 ? (
            <p className="text-gray-600">No doctors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-blue-100 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Username</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Specialty</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{doc.fullName}</td>
                      <td className="py-3 px-6 text-left">{doc.username}</td>
                      <td className="py-3 px-6 text-left">{doc.email}</td>
                      <td className="py-3 px-6 text-left">{doc.specialty}</td>
                      <td className="py-3 px-6 text-center">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mr-2"
                          onClick={() => startEditDoctor(doc)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                          onClick={() => deleteDoctor(doc._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* All Appointments Section - Sorted by Date */}
        <section className="mb-12 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">All Appointments (Sorted by Date)</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-600">No appointments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-blue-100 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Patient</th>
                    <th className="py-3 px-6 text-left">Doctor</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Time</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{appt.patientId?.fullName || 'N/A'}</td>
                      <td className="py-3 px-6 text-left whitespace-nowrap">{appt.doctorId?.fullName || 'N/A'}</td>
                      <td className="py-3 px-6 text-left">{appt.date}</td>
                      <td className="py-3 px-6 text-left">{appt.time}</td>
                      <td className="py-3 px-6 text-left">{appt.status}</td>
                      <td className="py-3 px-6 text-center">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mr-2"
                          onClick={() => startEditAppointment(appt)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                          onClick={() => deleteAppointment(appt._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Edit Doctor Modal */}
        {editingDoctor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4">Edit Doctor</h3>
              <form onSubmit={handleEditDoctorSubmit} className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={editDoctorFormData.fullName}
                  onChange={handleEditDoctorChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={editDoctorFormData.username}
                  onChange={handleEditDoctorChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={editDoctorFormData.email}
                  onChange={handleEditDoctorChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="specialty"
                  placeholder="Specialty"
                  value={editDoctorFormData.specialty}
                  onChange={handleEditDoctorChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Image URL"
                  value={editDoctorFormData.imageUrl}
                  onChange={handleEditDoctorChange}
                  className="w-full p-2 border rounded"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Appointment Modal */}
        {editingAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4">Edit Appointment</h3>
              <form onSubmit={handleEditAppointmentSubmit} className="space-y-4">
                <label htmlFor="edit-appointment-date" className="block mb-1 font-semibold">Date</label>
                <input
                  id="edit-appointment-date"
                  type="date"
                  name="date"
                  value={editAppointmentFormData.date}
                  onChange={handleEditAppointmentChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <label htmlFor="edit-appointment-time" className="block mb-1 font-semibold">Time</label>
                <select
                  id="edit-appointment-time"
                  name="time"
                  value={editAppointmentFormData.time}
                  onChange={handleEditAppointmentChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Time</option>
                  {allTimeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                <label htmlFor="edit-appointment-status" className="block mb-1 font-semibold">Status</label>
                <select
                  id="edit-appointment-status"
                  name="status"
                  value={editAppointmentFormData.status}
                  onChange={handleEditAppointmentChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditingAppointment(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
