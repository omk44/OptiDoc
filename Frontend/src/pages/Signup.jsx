// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Signup() {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     birthdate: "",
//     city: "",
//     aadhar: "",
//     gender: "",
//     username: "",
//     password: "",
//     role: "patient",
//   });

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const validate = () => {
//     const { name, email, phone, birthdate, city, aadhar, gender, username, password } = formData;
//     if (!name || !email || !phone || !birthdate || !city || !aadhar || !gender || !username || !password) {
//       return "All fields are required.";
//     }

//     if (!/^\d{10}$/.test(phone)) {
//       return "Phone number must be 10 digits.";
//     }

//     if (!/^\d{12}$/.test(aadhar)) {
//       return "Aadhar number must be 12 digits.";
//     }

//     return null;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const errorMsg = validate();
//     if (errorMsg) {
//       setError(errorMsg);
//       return;
//     }

//     const users = JSON.parse(localStorage.getItem("users")) || [];
//     const exists = users.find((u) => u.username === formData.username);

//     if (exists) {
//       setError("Username already exists.");
//       return;
//     }

//     users.push(formData);
//     localStorage.setItem("users", JSON.stringify(users));

//     alert("Signup successful. Please log in.");
//     navigate("/login");
//   };

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Patient Signup</h2>
//         {error && <p className="text-red-500 mb-3">{error}</p>}

//         <div className="grid grid-cols-1 gap-3">
//           <input type="text" name="name" placeholder="Full Name" className="p-2 border rounded" onChange={handleChange} />
//           <input type="email" name="email" placeholder="Email" className="p-2 border rounded" onChange={handleChange} />
//           <input type="text" name="phone" placeholder="Phone Number" className="p-2 border rounded" onChange={handleChange} />
//           <input type="date" name="birthdate" className="p-2 border rounded" onChange={handleChange} />
//           <input type="text" name="city" placeholder="City" className="p-2 border rounded" onChange={handleChange} />
//           <input type="text" name="aadhar" placeholder="Aadhar Card Number" className="p-2 border rounded" onChange={handleChange} />
          
//           <select name="gender" className="p-2 border rounded" onChange={handleChange} defaultValue="">
//             <option value="" disabled>Select Gender</option>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//             <option value="Other">Other</option>
//           </select>

//           <input type="text" name="username" placeholder="Username" className="p-2 border rounded" onChange={handleChange} />
//           <input type="password" name="password" placeholder="Password" className="p-2 border rounded" onChange={handleChange} />
//         </div>

//         <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Signup;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Ensure you have react-toastify installed: npm install react-toastify
import doctorIcon from "../assets/doctor_icon.png"; // Ensure this path and file exist
import bg from "../assets/bg.png"; // Ensure this path and file exist

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Combined formData fields from both examples, adjusted for consistency
  const [formData, setFormData] = useState({
    name: '',       // Corresponds to fullName in previous version
    email: '',
    phone: '',
    birthdate: '',  // Corresponds to bdate in previous version
    city: '',       // Corresponds to address in previous version
    aadhar: '',
    gender: '',
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
    const { name, email, phone, birthdate, city, aadhar, gender, username, password } = formData;

    if (!name || !email || !phone || !birthdate || !city || !aadhar || !gender || !username || !password) {
      return "All fields are required.";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be 10 digits.";
    }

    if (!/^\d{12}$/.test(aadhar)) {
      return "Aadhaar number must be 12 digits.";
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email address is invalid.";
    }

    return null; // No errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorMsg = validate();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    // Retrieve existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username already exists
    const exists = users.find((u) => u.username === formData.username);
    if (exists) {
      setError("Username already exists.");
      return;
    }

    // Add new user to the array (role is fixed to 'patient')
    users.push({ ...formData, role: 'patient' });
    localStorage.setItem("users", JSON.stringify(users));

    // Use toast for success notification instead of alert
    toast.success('Signup successful! Please login.');
    setTimeout(() => navigate('/login'), 1500); // Redirect to login page
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
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
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
            name="birthdate"
            type="date"
            placeholder="Birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          <input
            name="city"
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          <input
            name="aadhar"
            type="text"
            placeholder="Aadhaar Number (12 digits)"
            value={formData.aadhar}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-200 rounded-xl shadow-sm outline-none focus:border-blue-500 text-lg text-gray-800 bg-gray-50"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

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