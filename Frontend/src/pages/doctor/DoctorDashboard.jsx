import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
    newDate: "",
    newTime: ""
  });
  const [appointmentChanges, setAppointmentChanges] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchAppointmentChanges();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/doctor/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentChanges = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/notifications/${user._id}?role=doctor`);
      if (response.ok) {
        const data = await response.json();
        // Get all appointment-related notifications for this doctor
        const changesData = data.filter(notification => 
          ['appointment_cleared', 'appointment_delayed', 'appointment_canceled', 'appointment_updated', 'appointment_booked'].includes(notification.type)
        );
        setAppointmentChanges(changesData);
      }
    } catch (error) {
      console.error("Error fetching appointment changes:", error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !statusUpdate.status) return;

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...statusUpdate,
          doctorId: user._id,
        }),
      });

      if (response.ok) {
        await fetchAppointments();
        await fetchAppointmentChanges();
        setShowModal(false);
        setSelectedAppointment(null);
        setStatusUpdate({ status: "", notes: "", newDate: "", newTime: "" });
        alert("✅ Appointment status updated successfully!\n\n📧 Patient has been notified via email about the status change.");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    }
  };

  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setStatusUpdate({
      status: appointment.status,
      notes: appointment.notes || "",
      newDate: appointment.date,
      newTime: appointment.time
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "booked": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rescheduled": return "bg-yellow-100 text-yellow-800";
      case "canceled": return "bg-red-100 text-red-800";
      case "cleared": return "bg-green-100 text-green-800";
      case "delayed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const getChangeIcon = (type) => {
    switch (type) {
      case "appointment_cleared":
        return "✅";
      case "appointment_delayed":
        return "⏰";
      case "appointment_canceled":
        return "❌";
      case "appointment_updated":
        return "🔄";
      default:
        return "📝";
    }
  };

  const getChangeText = (notification) => {
    const { type, senderRole, senderName } = notification;
    const whoChanged = senderRole === 'admin' ? 'Admin' : senderRole === 'doctor' ? 'Doctor' : 'System';
    
    switch (type) {
      case "appointment_cleared":
        return `Completed by ${whoChanged}`;
      case "appointment_delayed":
        return `Rescheduled by ${whoChanged}`;
      case "appointment_canceled":
        return `Canceled by ${whoChanged}`;
      case "appointment_updated":
        return `Updated by ${whoChanged}`;
      case "appointment_booked":
        return `New appointment booked`;
      default:
        return `Modified by ${whoChanged}`;
    }
  };

  const formatChangeTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalAppointments = appointments.length;
  const bookedCount = appointments.filter(a => a.status === 'booked').length;
  const completedCount = appointments.filter(a => a.status === 'completed' || a.status === 'cleared').length;
  const rescheduledCount = appointments.filter(a => a.status === 'rescheduled' || a.status === 'delayed').length;
  const canceledCount = appointments.filter(a => a.status === 'canceled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white py-12 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
                <span className="text-white font-bold text-3xl">
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || "D"}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome, Dr. {user.fullName || user.username}
                </h1>
                <p className="text-blue-100 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Specialty: {user.specialty}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center space-x-2 border border-white/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-gray-600 text-sm font-medium mb-1">Booked</p>
                <p className="text-3xl font-bold text-gray-900">{bookedCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Rescheduled</p>
                <p className="text-3xl font-bold text-gray-900">{rescheduledCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Appointments Dashboard</h2>
              <p className="text-gray-600 leading-relaxed">
                Manage your appointments and update their status. Patients and administrators will be notified of any changes via email.
              </p>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                All Appointments
              </h3>
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-500">You don't have any appointments scheduled at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-6">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {appointment.patientId?.fullName?.charAt(0) || "P"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {appointment.patientId?.fullName || "Unknown Patient"}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {appointment.patientId?.email}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold">{appointment.time}</span>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status.toUpperCase()}
                          </span>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold text-blue-700">Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => openStatusModal(appointment)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Appointment Changes */}
        {appointmentChanges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Recent Changes
                </h3>
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {appointmentChanges.length} Updates
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Latest appointment updates and notifications
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {appointmentChanges.slice(0, 5).map((change, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl flex-shrink-0">{getChangeIcon(change.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-900">
                          {getChangeText(change)}
                        </p>
                        <p className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">
                          {formatChangeTime(change.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">{change.appointmentDate}</span>
                        <span className="text-gray-400">•</span>
                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">{change.appointmentTime}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {change.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-5 rounded-t-2xl">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Appointment
                </h3>
                <p className="text-blue-100 text-sm mt-1">Modify appointment status and details</p>
              </div>

              <div className="p-6">
                {/* Current Appointment Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Current Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Patient:</span> {selectedAppointment.patientId?.fullName}
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
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
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
                        <input
                          type="time"
                          value={statusUpdate.newTime}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, newTime: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-900 font-bold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Notes <span className="text-gray-500 font-normal text-sm">(Optional)</span>
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      rows="4"
                      placeholder="Add any notes or reasons for the change..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedAppointment(null);
                      setStatusUpdate({ status: "", notes: "", newDate: "", newTime: "" });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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

export default DoctorDashboard;
