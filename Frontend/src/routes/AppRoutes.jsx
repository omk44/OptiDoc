import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientDashboard from '../pages/patient/PatientDashboard';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AppRoutes() {
  const { role } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/admin/dashboard" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/doctor/dashboard" element={role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} />
      <Route path="/patient/dashboard" element={role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
