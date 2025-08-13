import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AllDoctors from "./pages/AllDoctors";
import BookingForm from "./pages/BookingForm";
import Appointments from "./pages/Appointments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Profile from "./pages/Profile";

function App() {
  const { user } = useAuth();

  // If user is admin, redirect to admin dashboard
  if (user && user.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route path="/doctors" element={user ? <AllDoctors /> : <Navigate to="/login" replace />} />
        <Route path="/book" element={user ? <BookingForm /> : <Navigate to="/login" replace />} />
        <Route path="/appointments" element={user ? <Appointments /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Route>
    </Routes>
  );
}

export default App;