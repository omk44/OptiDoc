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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold text-lg">Loading Admin Dashboard...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Error</h3>
        <p className="text-red-600 text-center">{error}</p>
      </div>
    </div>
  );

  // Calculate stats
  const totalPatients = new Set(appointments.map(a => a.patientId?._id)).size;
  const totalDoctors = doctors.length;
  const totalAppointments = appointments.length;
  const bookedCount = appointments.filter(a => a.status === 'booked').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Header with Admin Info and Logout */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">OptiDoc Admin Dashboard</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/30">
                    {user?.fullName || user?.username || 'Admin'}
                  </span>
                  <span className="text-blue-100 text-sm">
                    @{user?.username}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationDropdown />
              
              <button
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-2 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2 border border-white/30 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{totalAppointments}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900">{totalDoctors}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Booked</p>
                <p className="text-3xl font-bold text-gray-900">{bookedCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-indigo-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Admin Profile Section */}
        <section className="mb-8 bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin Profile Management
            </h2>
          </div>
          
          <div className="p-6">
            {adminError && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
                <p className="text-red-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {adminError}
                </p>
              </div>
            )}
            {adminSuccess && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl">
                <p className="text-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {adminSuccess}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-bold mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={adminForm.fullName || ""}
                  onChange={handleAdminChange}
                  disabled={!editAdminMode}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={adminForm.email || ""}
                  onChange={handleAdminChange}
                  disabled={!editAdminMode}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-900 font-bold mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={adminForm.username || ""}
                  onChange={handleAdminChange}
                  disabled={!editAdminMode}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                />
              </div>
            </div>
            
            {editAdminMode && (
              <div className="mt-6 p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={adminPasswords.new}
                      onChange={handleAdminPasswordChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={adminPasswords.confirm}
                      onChange={handleAdminPasswordChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6 space-x-4">
              {editAdminMode ? (
                <>
                  <button
                    onClick={handleAdminSave}
                    disabled={adminLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                  >
                    {adminLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setEditAdminMode(false); setAdminForm(user); setAdminError(""); setAdminSuccess(""); setAdminPasswords({ new: '', confirm: '' }); }}
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditAdminMode(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>
        {/* Add Doctor Section */}
        <section className="mb-8 bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manage Doctors
            </h2>
          </div>
          
          <div className="p-6">
            <button
              onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showAddDoctorForm ? "Hide Add Doctor Form" : "Add New Doctor"}
            </button>

            {showAddDoctorForm && (
              <form onSubmit={handleAddDoctorSubmit} className="mt-6 p-6 border-2 border-green-200 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-xl font-bold mb-6 text-green-900 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add New Doctor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name *"
                    value={newDoctorData.fullName}
                    onChange={handleNewDoctorChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username *"
                    value={newDoctorData.username}
                    onChange={handleNewDoctorChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={newDoctorData.email}
                    onChange={handleNewDoctorChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password *"
                    value={newDoctorData.password}
                    onChange={handleNewDoctorChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="specialty"
                    placeholder="Specialty *"
                    value={newDoctorData.specialty}
                    onChange={handleNewDoctorChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="Image URL (optional)"
                    value={newDoctorData.imageUrl}
                    onChange={handleNewDoctorChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-gray-900 font-bold mb-2">Doctor Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewDoctorFileChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Doctor
                </button>
              </form>
            )}
          </div>
        </section>

        {/* All Doctors Table */}
        <section className="mb-8 bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                All Doctors
              </h2>
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {doctors.length} Total
              </span>
            </div>
          </div>
          
          {doctors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-500">Add your first doctor to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-100 to-cyan-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Username</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Specialty</th>
                    <th className="py-4 px-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-900">{doc.fullName}</td>
                      <td className="py-4 px-6 text-gray-700">{doc.username}</td>
                      <td className="py-4 px-6 text-gray-700">{doc.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {doc.specialty}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                            onClick={() => startEditDoctor(doc)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                            onClick={() => deleteDoctor(doc._id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* All Appointments Section - Sorted by Date */}
        <section className="mb-8 bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                All Appointments (Sorted by Date)
              </h2>
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {appointments.length} Total
              </span>
            </div>
          </div>
          
          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">Appointments will appear here once patients book them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Patient</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Doctor</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Time</th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-purple-50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-900">{appt.patientId?.fullName || 'N/A'}</td>
                      <td className="py-4 px-6 whitespace-nowrap font-semibold text-gray-900">{appt.doctorId?.fullName || 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-700">{appt.date}</td>
                      <td className="py-4 px-6 text-gray-700">{appt.time}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          appt.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                          appt.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appt.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                            onClick={() => openStatusModal(appt)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Update
                          </button>
                          <button
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                            onClick={() => deleteAppointment(appt._id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-5 rounded-t-2xl">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Doctor
                </h3>
                <p className="text-yellow-100 text-sm mt-1">Update doctor information</p>
              </div>

              <form onSubmit={handleEditDoctorSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={editDoctorFormData.fullName}
                      onChange={handleEditDoctorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={editDoctorFormData.username}
                      onChange={handleEditDoctorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={editDoctorFormData.email}
                      onChange={handleEditDoctorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Password <span className="text-gray-500 font-normal text-sm">(leave blank to keep current)</span></label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Change Password (optional)"
                      value={editDoctorFormData.password}
                      onChange={handleEditDoctorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Specialty</label>
                    <input
                      type="text"
                      name="specialty"
                      placeholder="Specialty"
                      value={editDoctorFormData.specialty}
                      onChange={handleEditDoctorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Image URL</label>
                    <input
                      type="text"
                      name="imageUrl"
                      placeholder="Image URL"
                      value={editDoctorFormData.imageUrl}
                      onChange={handleEditDoctorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditDoctorFileChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-5 rounded-t-2xl">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Appointment Status
                </h3>
                <p className="text-purple-100 text-sm mt-1">Modify appointment details and notify all parties</p>
              </div>

              <div className="p-6">
                {/* Current Appointment Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Current Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Patient:</span> {selectedAppointment.patientId?.fullName}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Doctor:</span> {selectedAppointment.doctorId?.fullName}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Date:</span> {selectedAppointment.date}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Time:</span> {selectedAppointment.time}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-gray-900 font-bold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                    >
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </div>

                  {/* Conditional Date/Time for Rescheduled */}
                  {statusUpdate.status === "rescheduled" && (
                    <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500 space-y-4">
                      <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Set New Schedule
                      </p>
                      <div>
                        <label className="block text-gray-900 font-bold mb-2">New Date</label>
                        <input
                          type="date"
                          value={statusUpdate.newDate}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, newDate: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-900 font-bold mb-2">New Time</label>
                        <select
                          value={statusUpdate.newTime}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, newTime: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        >
                          <option value="">Select time</option>
                          {allTimeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-900 font-bold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Notes <span className="text-gray-500 font-normal text-sm">(Optional)</span>
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      rows="4"
                      placeholder="Add any notes or reasons for the change..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedAppointment(null);
                      setStatusUpdate({ status: "", notes: "", newDate: "", newTime: "" });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdateSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Status
                  </button>
                </div>
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
