import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Notification API functions
export const notificationAPI = {
  // Get notifications for a user
  getNotifications: async (userId, role) => {
    const response = await api.get(`/notifications/${userId}?role=${role}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId, role) => {
    const response = await api.put(`/notifications/${userId}/read-all?role=${role}`);
    return response.data;
  },

  // Update appointment status (doctor only)
  updateAppointmentStatus: async (appointmentId, statusData) => {
    const response = await api.put(`/appointments/${appointmentId}/status`, statusData);
    return response.data;
  },

  // Get doctor appointments
  getDoctorAppointments: async (doctorId) => {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  }
};