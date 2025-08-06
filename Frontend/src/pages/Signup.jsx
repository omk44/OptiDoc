
import React, { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Ensure you have react-toastify installed: npm install react-toastify
import doctorIcon from "../assets/doctor_icon.png"; // Ensure this path and file exist
import bg from "../assets/bg.png"; // Ensure this path and file exist

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Combined formData fields from both examples, adjusted for consistency
  const [formData, setFormData] = useState({
    fullName: '',       // Corresponds to fullName in previous version
    email: '',
    phone: '',
    username: '',   // New field for login username
    password: '',
    role: 'patient', // Fixed to 'patient' as per requirement
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  // Validation function
  const validate = () => {
    const { fullName, email, phone, username, password } = formData;

    if (!fullName || !email || !phone || !username || !password) {
      return "All fields are required.";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be 10 digits.";
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email address is invalid.";
    }

    return null; // No errors
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const errorMsg = validate();
  if (errorMsg) {
    setError(errorMsg);
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
        role: "patient", // fixed for signup
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Signup successful! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setError(data.message || "Signup failed.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    setError("Something went wrong. Try again later.");
  }
};


  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel: Signup Form */}
      <div className="w-2/5 bg-white flex flex-col justify-center items-center px-8 py-12 shadow-lg rounded-r-lg">
        <div className="flex flex-col items-center mb-8">
          <img src={doctorIcon} alt="OptiDoc" className="w-24 h-24 rounded-full mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">OptiDoc</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Patient Sign Up</h2>

          {/* Input fields with consistent styling */}
          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          <input
            name="phone"
            type="tel" // Use tel for phone numbers
            placeholder="Phone Number (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />


          <input
            name="username"
            type="text"
            placeholder="Choose a Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          <input
            name="password"
            type="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-xl py-4 text-xl font-bold hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg"
          >
            Sign Up
          </button>

          <p className="text-base text-center mt-4 text-gray-600">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-600 cursor-pointer hover:underline font-semibold"
            >
              Login
            </span>
          </p>
        </form>
      </div>

      {/* Right Panel: Info */}
      <div
        className="w-[70%] bg-cover bg-center text-white p-12 flex flex-col justify-between rounded-l-lg"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg})`,
        }}
      >
        {/* Navigation Buttons */}
        <nav className="flex justify-end gap-6">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white rounded-full px-6 py-3 text-lg font-semibold hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-md"
          >
            Login
          </button>
        </nav>

        {/* Main Content */}
        <div className="max-w-2xl text-center mx-auto">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">Welcome to OptiDoc</h1>
          <p className="text-xl leading-relaxed opacity-90">
            Join thousands of patients managing appointments and health records seamlessly with our secure and smart system.
          </p>
        </div>

        <div /> {/* Spacer */}
      </div>
    </div>
  );
}

export default Signup;