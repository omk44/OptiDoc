import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import aboutImg from "../assets/about.png";

const getUpdateEndpoint = (role, id) => {
  if (role === "doctor") return `/appointments/doctors/${id}`;
  if (role === "patient") return `/auth/patients/${id}`; // Ensure this exists in backend
  if (role === "admin") return `/auth/admins/${id}`; // Ensure this exists in backend
  return null;
};

export default function Profile() {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  if (!user) return <div className="p-8 text-center">Please login to view your profile.</div>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    // Password validation
    if (showPassword) {
      if (!passwords.new || !passwords.confirm) {
        setError("New password fields cannot be empty.");
        setLoading(false);
        return;
      }
      if (passwords.new !== passwords.confirm) {
        setError("New passwords do not match.");
        setLoading(false);
        return;
      }
    }
    try {
      const endpoint = getUpdateEndpoint(user.role, user._id);
      if (!endpoint) throw new Error("Update endpoint not implemented for this user type.");
      const payload = { ...form };
      if (showPassword && passwords.new) payload.password = passwords.new;
      const { data } = await api.put(endpoint, payload);
      // Update AuthContext and localStorage
      const updatedUser = data.doctor || data.patient || data.admin || form;
      login(updatedUser);
      setEditMode(false);
      setShowPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <div className="flex flex-col items-center mb-6">
        <img
          src={aboutImg}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-blue-200 mb-2"
        />
        <h2 className="text-2xl font-bold text-blue-700 mb-1">{form.fullName || form.username}</h2>
        <span className="text-gray-500 capitalize">{user.role}</span>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {user.role === "patient" && (
          <div>
            <label className="block text-gray-700 font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
        <div>
          <label className="block text-gray-700 font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={form.username || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {user.role === "doctor" && (
          <>
            <div>
              <label className="block text-gray-700 font-medium">Specialty</label>
              <input
                type="text"
                name="specialty"
                value={form.specialty || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Profile Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl || ""}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end mt-6 space-x-4">
        {editMode ? (
          <>
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="px-6 py-2 bg-gray-200 text-blue-700 rounded hover:bg-gray-300 transition-colors"
              type="button"
            >
              {showPassword ? "Cancel Password Change" : "Change Password"}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setEditMode(false); setForm(user); setError(""); setSuccess(""); setShowPassword(false); setPasswords({ current: '', new: '', confirm: '' }); }}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
      {editMode && showPassword && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Change Password</h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">New Password</label>
            <input
              type="password"
              name="new"
              value={passwords.new}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Confirm New Password</label>
            <input
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
