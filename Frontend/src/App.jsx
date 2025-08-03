// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BookingForm from "./pages/BookingForm";
import Layout from "./components/Layout";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllDoctors from "./pages/AllDoctors";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
<Route path="/doctors" element={<AllDoctors />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/book" element={<BookingForm />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
