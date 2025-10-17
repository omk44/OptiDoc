import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../components/Footer";
import NotificationDropdown from "../../components/NotificationDropdown";

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
  const [editAdminMode, setEditAdminMode] = useState(false);
  const [adminForm, setAdminForm] = useState(user || {});
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminPasswords, setAdminPasswords] = useState({ new: '', confirm: '' });
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
  const [newDoctorFile, setNewDoctorFile] = useState(null);

  // State for Edit Doctor Modal
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editDoctorFormData, setEditDoctorFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    specialty: '',
    imageUrl: '',
    password: ''
  });
  const [editDoctorFile, setEditDoctorFile] = useState(null);

  // State for Appointment Status Update Modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
    newDate: "",
    newTime: ""
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


  // handle admin form changes 
  const handleAdminChange = (e) => {
  setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
};

const handleAdminPasswordChange = (e) => {
  setAdminPasswords({ ...adminPasswords, [e.target.name]: e.target.value });
};

// handle admin save

const handleAdminSave = async () => {
  setAdminLoading(true);
  setAdminError("");
  setAdminSuccess("");
  if (editAdminMode && (adminPasswords.new || adminPasswords.confirm)) {
    if (!adminPasswords.new || !adminPasswords.confirm) {
      setAdminError("New password fields cannot be empty.");
      setAdminLoading(false);
      return;
    }
    if (adminPasswords.new !== adminPasswords.confirm) {
      setAdminError("New passwords do not match.");
      setAdminLoading(false);
      return;
    }
  }
  try {
    const payload = { ...adminForm };
    if (adminPasswords.new) payload.password = adminPasswords.new;
    const { data } = await api.put(`/auth/admins/${user._id}`, payload);
    const updatedAdmin = data.admin || adminForm;
    setAdminForm(updatedAdmin);
    setEditAdminMode(false);
    setAdminPasswords({ new: '', confirm: '' });
    setAdminSuccess("Admin profile updated successfully!");
  } catch (err) {
    setAdminError(err.response?.data?.message || err.message || "Failed to update admin profile.");
  } finally {
    setAdminLoading(false);
  }
};
  // --- Doctor CRUD Operations ---

  const handleNewDoctorChange = (e) => {
    setNewDoctorData({ ...newDoctorData, [e.target.name]: e.target.value });
  };
  const handleNewDoctorFileChange = (e) => {
    setNewDoctorFile(e.target.files?.[0] || null);
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!newDoctorData.fullName || !newDoctorData.username || !newDoctorData.email || !newDoctorData.password || !newDoctorData.specialty) {
        alert("Please fill all required fields for the new doctor.");
        return;
      }
      const form = new FormData();
      form.append('fullName', newDoctorData.fullName);
      form.append('username', newDoctorData.username);
      form.append('email', newDoctorData.email);
      form.append('password', newDoctorData.password);
      form.append('specialty', newDoctorData.specialty);
      if (newDoctorFile) form.append('image', newDoctorFile);
      const response = await api.post("/appointments/doctors", form);
      alert(`${response.data.message}\n\n📧 Login credentials have been sent to the doctor's email address.`);
      setNewDoctorData({ fullName: '', username: '', email: '', password: '', specialty: '', imageUrl: '' });
      setNewDoctorFile(null);
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
  const handleEditDoctorFileChange = (e) => {
    setEditDoctorFile(e.target.files?.[0] || null);
  };

  const handleEditDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editDoctorFormData.fullName || !editDoctorFormData.username || !editDoctorFormData.email || !editDoctorFormData.specialty) {
        alert("Please fill all required fields for doctor details.");
        return;
      }
      const form = new FormData();
      form.append('fullName', editDoctorFormData.fullName);
      form.append('username', editDoctorFormData.username);
      form.append('email', editDoctorFormData.email);
      if (editDoctorFormData.password) {
      form.append('password', editDoctorFormData.password); // Only send if filled
    }
      form.append('specialty', editDoctorFormData.specialty);
      if (editDoctorFile) form.append('image', editDoctorFile);
      const response = await api.put(`/appointments/doctors/${editingDoctor._id}`, form);
      alert(`${response.data.message}\n\n📧 Doctor has been notified via email about the profile update.`);
      setEditingDoctor(null);
      setEditDoctorFile(null);
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

  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setStatusUpdate({
      status: appointment.status,
      notes: "",
      newDate: appointment.date,
      newTime: appointment.time
    });
    setShowStatusModal(true);
  };

  const handleStatusUpdateSubmit = async () => {
    if (!selectedAppointment || !statusUpdate.status) return;

    try {
      const response = await api.put(`/appointments/${selectedAppointment._id}/status-admin`, {
        ...statusUpdate,
        adminId: user._id,
        adminName: user.fullName || user.username
      });

      if (response.status === 200) {
        await fetchData();
        setShowStatusModal(false);
        setSelectedAppointment(null);
        setStatusUpdate({ status: "", notes: "", newDate: "", newTime: "" });
        alert("✅ Appointment status updated successfully!\n\n📧 Patient and Doctor have been notified via email about the status change.");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert(error.response?.data?.message || "Failed to update appointment status");
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
              
              {/* Notifications */}
              <NotificationDropdown />
              
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
        <section className="mb-12 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Edit Admin Profile</h2>
        {adminError && <div className="text-red-600 mb-2">{adminError}</div>}
        {adminSuccess && <div className="text-green-600 mb-2">{adminSuccess}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={adminForm.fullName || ""}
              onChange={handleAdminChange}
              disabled={!editAdminMode}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={adminForm.email || ""}
              onChange={handleAdminChange}
              disabled={!editAdminMode}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={adminForm.username || ""}
              onChange={handleAdminChange}
              disabled={!editAdminMode}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {editAdminMode && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Change Password</h3>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={adminPasswords.new}
                  onChange={handleAdminPasswordChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={adminPasswords.confirm}
                  onChange={handleAdminPasswordChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          {editAdminMode ? (
            <>
              <button
                onClick={handleAdminSave}
                disabled={adminLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {adminLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditAdminMode(false); setAdminForm(user); setAdminError(""); setAdminSuccess(""); setAdminPasswords({ new: '', confirm: '' }); }}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditAdminMode(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </section>
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
              <input
                type="file"
                accept="image/*"
                onChange={handleNewDoctorFileChange}
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
                    <th className="py-3 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{appt.patientId?.fullName || 'N/A'}</td>
                      <td className="py-3 px-6 text-left whitespace-nowrap">{appt.doctorId?.fullName || 'N/A'}</td>
                      <td className="py-3 px-6 text-left">{appt.date}</td>
                      <td className="py-3 px-6 text-left">{appt.time}</td>
                      <td className="py-3 px-6 text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          appt.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                          appt.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mr-2"
                          onClick={() => openStatusModal(appt)}
                        >
                          Update Status
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
                  type="password"
                  name="password"
                  placeholder="Change Password (leave blank to keep current)"
                  value={editDoctorFormData.password}
                  onChange={handleEditDoctorChange}
                  className="w-full p-2 border rounded"
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditDoctorFileChange}
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

        {/* Status Update Modal */}
        {showStatusModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Update Appointment Status</h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600"><strong>Patient:</strong> {selectedAppointment.patientId?.fullName}</p>
                <p className="text-sm text-gray-600"><strong>Doctor:</strong> {selectedAppointment.doctorId?.fullName}</p>
                <p className="text-sm text-gray-600"><strong>Current Date:</strong> {selectedAppointment.date}</p>
                <p className="text-sm text-gray-600"><strong>Current Time:</strong> {selectedAppointment.time}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>

                {statusUpdate.status === "rescheduled" && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">New Date</label>
                      <input
                        type="date"
                        value={statusUpdate.newDate}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, newDate: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">New Time</label>
                      <select
                        value={statusUpdate.newTime}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, newTime: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select time</option>
                        {allTimeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Notes (Optional)</label>
                  <textarea
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    rows="3"
                    placeholder="Add any notes or reasons for the change..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedAppointment(null);
                    setStatusUpdate({ status: "", notes: "", newDate: "", newTime: "" });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdateSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Update Status
                </button>
              </div>
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
