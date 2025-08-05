import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AllDoctors from "./pages/AllDoctors";
import BookingForm from "./pages/BookingForm";
import Appointments from "./pages/Appointments";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth(); // get user from AuthContext

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Redirect root `/` to /login if not logged in */}
        <Route
          index
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />
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
