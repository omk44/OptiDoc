// // src/pages/Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { dummyUsers } from "../data/users";

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     role: "patient",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const matchedUser = dummyUsers.find(
//       (u) =>
//         u.username === formData.username &&
//         u.password === formData.password &&
//         u.role === formData.role
//     );

//     if (matchedUser) {
//       login(matchedUser);
//       // Navigate based on role
//       if (matchedUser.role === "admin") navigate("/admin-dashboard");
//       else if (matchedUser.role === "doctor") navigate("/doctor-dashboard");
//       else if (matchedUser.role === "patient") navigate("/patient-dashboard");
//     } else {
//       setError("Invalid credentials or role mismatch.");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded shadow-md w-full max-w-sm"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

//         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

//         <div className="mb-4">
//           <label className="block mb-1">Username</label>
//           <input
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block mb-1">Password</label>
//           <input
//             name="password"
//             type="password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block mb-1">Login as</label>
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded"
//           >
//             <option value="patient">Patient</option>
//             <option value="doctor">Doctor</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
//         >
//           Login
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;

// Assume these are defined elsewhere in your project:
// 1. src/context/AuthContext.jsx: Provides the authentication context (useAuth hook)
//    Example (AuthContext.jsx):
//    import React, { createContext, useContext, useState, useEffect } from 'react';
//    const AuthContext = createContext(null);
//    export const AuthProvider = ({ children }) => {
//      const [user, setUser] = useState(() => {
//        const storedUser = localStorage.getItem('user');
//        return storedUser ? JSON.parse(storedUser) : { isLoggedIn: false, name: '', role: '' };
//      });
//
//      const login = (userData) => {
//        setUser({ isLoggedIn: true, ...userData });
//        localStorage.setItem('user', JSON.stringify({ isLoggedIn: true, ...userData }));
//      };
//
//      const logout = () => {
//        setUser({ isLoggedIn: false, name: '', role: '' });
//        localStorage.removeItem('user');
//      };
//
//      return (
//        <AuthContext.Provider value={{ user, login, logout }}>
//          {children}
//        </AuthContext.Provider>
//      );
//    };
//    export const useAuth = () => useContext(AuthContext);
//
// 2. src/data/users.js: Contains dummy user data for demonstration
//    Example (users.js):
//    export const dummyUsers = [
//      { username: 'patient@example.com', password: 'password123', role: 'patient', name: 'John Doe' },
//      { username: 'doctor@example.com', password: 'password123', role: 'doctor', name: 'Dr. Smith' },
//      { username: 'admin@example.com', password: 'admin123', role: 'admin', name: 'Admin User' },
//    ];
import React, { useState } from 'react';
import { useNavigate,Navigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import doctorIcon from "../assets/doctor_icon.png"; // Ensure this path and file exist
import bg from "../assets/bg.png"; // Ensure this path and file exist


import { useAuth } from "../context/AuthContext";
import { dummyUsers } from "../data/users";

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

  const handleLogin = (e) => {
    e.preventDefault();

    const matchedUser = dummyUsers.find(
      (user) =>
        user.username === formData.username &&
        user.password === formData.password &&
        user.role === formData.role
    );

    if (matchedUser) {
      login(matchedUser);
      localStorage.setItem('user', JSON.stringify({ isLoggedIn: true, ...matchedUser }));

      if (matchedUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (matchedUser.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (matchedUser.role === 'patient') {
        navigate('/');
      }
    } else {
      setError('Invalid credentials or role mismatch.');
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
              type="email"
              placeholder="Email (e.g., patient@example.com)"
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