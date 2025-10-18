import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import doctorIcon from "../assets/doctor_icon.png";
import bg from "../assets/bg.png";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
    console.log("Form Data submitted:", formData);

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
        login(data.user);
        console.log("Logged in user data from backend:", data.user);
        console.log("Logged in user role from backend:", data.user.role);

        // Navigate based on role (using hyphenated path)
        if (data.user.role === "admin") {
          navigate("/admin-dashboard"); // This is correct
        } else if (data.user.role === "doctor" || data.user.role === "patient") {
          navigate("/");
        } else {
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'patient':
        return '👤';
      case 'doctor':
        return '👨‍⚕️';
      case 'admin':
        return '🔐';
      default:
        return '👤';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'patient':
        return 'Book appointments with our expert doctors';
      case 'doctor':
        return 'Manage your appointments and patient care';
      case 'admin':
        return 'System administration and management';
      default:
        return 'Access your account';
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={doctorIcon} alt="OptiDoc" className="w-20 h-20 rounded-full shadow-lg" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">OptiDoc</h1>
            <p className="text-gray-600">Your Health, Our Priority</p>
          </div>

          {/* Login Type Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-3">
              {['patient', 'doctor', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFormData(prev => ({ ...prev, role }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.role === role
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-2xl mb-2">{getRoleIcon(role)}</div>
                  <div className="text-sm font-semibold capitalize">{role}</div>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              {getRoleDescription(formData.role)}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div className="w-full lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center h-full text-white p-8 lg:p-12">
          <div className="max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to OptiDoc
            </h2>
            <p className="text-xl lg:text-2xl leading-relaxed mb-8 opacity-90">
              India's most trusted digital platform to schedule your doctor appointments from anywhere, anytime. Fast. Secure. Reliable.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Easy appointment booking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Expert medical professionals</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">24/7 online support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;