import React, { useState } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import doctorIcon from "../assets/doctor_icon.png"; // Ensure this path and file exist
import bg from "../assets/bg.png"; // Ensure this path and file exist
import { api } from '../api';

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient', // Default login role
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Correctly pass the 'user' object from the backend response to the login function.
        // The backend sends { message: 'Login successful', user: { ... } }.
        // The login function in AuthContext expects the user object directly.
        login(data.user);

        // Navigate based on role, using the role from the 'user' object
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (data.user.role === "patient") {
          navigate("/");
        }
      } else {
        setError(data.message || "Login failed. Please check credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again later.");
    }
  };


  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Left Panel - Login Form */}
      <div className="w-2/6 bg-white flex flex-col items-center justify-center p-8 shadow-lg rounded-r-lg">
        <img src={doctorIcon} alt="OptiDoc" className="w-24 h-24 rounded-full mb-6" />
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">OptiDoc</h1>

        {/* Login Type Selection Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out
              ${formData.role === 'patient' ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Patient Login
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out
              ${formData.role === 'doctor' ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Doctor Login
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out
              ${formData.role === 'admin' ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Admin Login
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col w-full max-w-sm gap-6">
          <div className="flex items-center bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 focus-within:border-blue-500">
            <FaEnvelope className="mr-3 text-gray-500 text-xl" />
            <input
              type="username" // Changed from type="email" to type="username" for consistency with placeholder
              placeholder="UserName (e.g., patient@example.com)"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full outline-none bg-transparent text-gray-800 text-lg"
            />
          </div>
          <div className="flex items-center bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 focus-within:border-blue-500">
            <FaLock className="mr-3 text-gray-500 text-xl" />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full outline-none bg-transparent text-gray-800 text-lg"
            />
          </div>
          {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl py-4 text-xl font-bold hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg"
          >
            Login
          </button>
        </form>
      </div>

      {/* Right Panel - Marketing/Info Section */}
      <div
        className="w-[70%] bg-cover bg-center text-white p-12 flex flex-col justify-between rounded-l-lg"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg})`,
        }}
      >
        {/* Navigation Buttons */}
        <nav className="flex justify-end gap-6">

          <button
            onClick={() => navigate("/signup")}
            className="bg-blue-600 text-white rounded-full px-6 py-3 text-lg font-semibold hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md"
          >
            Signup
          </button>
        </nav>

        {/* Welcome Message */}
        <div className="max-w-2xl text-center mx-auto">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">Welcome to OptiDoc</h1>
          <p className="text-xl leading-relaxed opacity-90">
            India’s most trusted digital platform to schedule your doctor appointments from anywhere, anytime. Fast. Secure. Reliable.
          </p>
        </div>
        {/* Empty div for spacing at the bottom if needed */}
        <div></div>
      </div>
    </div>
  );
};

export default Login;