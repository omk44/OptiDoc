import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    city: "",
    aadhar: "",
    gender: "",
    username: "",
    password: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const { name, email, phone, birthdate, city, aadhar, gender, username, password } = formData;
    if (!name || !email || !phone || !birthdate || !city || !aadhar || !gender || !username || !password) {
      return "All fields are required.";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be 10 digits.";
    }

    if (!/^\d{12}$/.test(aadhar)) {
      return "Aadhar number must be 12 digits.";
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorMsg = validate();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((u) => u.username === formData.username);

    if (exists) {
      setError("Username already exists.");
      return;
    }

    users.push(formData);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful. Please log in.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Patient Signup</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <div className="grid grid-cols-1 gap-3">
          <input type="text" name="name" placeholder="Full Name" className="p-2 border rounded" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" className="p-2 border rounded" onChange={handleChange} />
          <input type="text" name="phone" placeholder="Phone Number" className="p-2 border rounded" onChange={handleChange} />
          <input type="date" name="birthdate" className="p-2 border rounded" onChange={handleChange} />
          <input type="text" name="city" placeholder="City" className="p-2 border rounded" onChange={handleChange} />
          <input type="text" name="aadhar" placeholder="Aadhar Card Number" className="p-2 border rounded" onChange={handleChange} />
          
          <select name="gender" className="p-2 border rounded" onChange={handleChange} defaultValue="">
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input type="text" name="username" placeholder="Username" className="p-2 border rounded" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="p-2 border rounded" onChange={handleChange} />
        </div>

        <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
