import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      case "cleared": return "bg-green-100 text-green-800";
      case "delayed": return "bg-yellow-100 text-yellow-800";
      case "canceled": return "bg-red-100 text-red-800";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || "D"}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, Dr. {user.fullName || user.username}
                </h1>
                <p className="text-gray-600">Specialty: {user.specialty}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Appointments</h2>
              <p className="text-gray-600">
                Manage your appointments and update their status. Patients and administrators will be notified of any changes.
              </p>
            </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Appointments ({appointments.length})
            </h3>
          </div>
          
          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-500">You don't have any appointments scheduled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {appointment.patientId?.fullName?.charAt(0) || "P"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientId?.fullName || "Unknown Patient"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patientId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {appointment.notes || "No notes"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openStatusModal(appointment)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Appointment Changes */}
        {appointmentChanges.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Changes ({appointmentChanges.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Latest appointment updates and changes
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {appointmentChanges.slice(0, 5).map((change, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{getChangeIcon(change.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {getChangeText(change)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatChangeTime(change.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {change.appointmentDate} at {change.appointmentTime}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update Appointment Status
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient: {selectedAppointment.patientId?.fullName}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Date: {formatDate(selectedAppointment.date)} at {selectedAppointment.time}
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="booked">Booked</option>
                    <option value="cleared">Cleared/Completed</option>
                    <option value="delayed">Delayed/Rescheduled</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>

                {statusUpdate.status === "delayed" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Date
                      </label>
                      <input
                        type="date"
                        value={statusUpdate.newDate}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, newDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Time
                      </label>
                      <input
                        type="time"
                        value={statusUpdate.newTime}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, newTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this appointment..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
