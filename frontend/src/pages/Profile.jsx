import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import aboutImg from "../assets/about.png";

const getUpdateEndpoint = (role, id) => {
  if (role === "doctor") return `/doctors/${id}`;
  if (role === "patient") return `/auth/patients/${id}`;
  if (role === "admin") return `/auth/admins/${id}`;
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

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Login Required</h2>
        <p className="text-gray-600">Please login to view your profile.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={aboutImg}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{form.fullName || form.username}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                  {user.role}
                </span>
                {user.role === 'doctor' && form.specialty && (
                  <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {form.specialty}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{form.email}</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h3>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                  editMode
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                  editMode
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            {user.role === "patient" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    editMode
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                  editMode
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            {user.role === "doctor" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    value={form.specialty || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      editMode
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={form.imageUrl || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      editMode
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {editMode && (
            <div className="mt-8 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold flex items-center gap-2"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {showPassword ? "Cancel Password Change" : "Change Password"}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm(user);
                  setError("");
                  setSuccess("");
                  setShowPassword(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                }}
                className="px-6 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        {editMode && showPassword && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

