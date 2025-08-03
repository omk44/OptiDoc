import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <div className="text-lg font-bold">OptiDoc</div>
      <div className="space-x-4">
        {user && (
          <>
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/doctors" className="hover:underline">
              All Doctors
            </Link>
            <Link to="/appointments" className="hover:underline">
              Appointments
            </Link>
            <span className="font-semibold">
              {user.username} ({user.role})
            </span>
            <button onClick={handleLogout} className="ml-2 hover:underline">
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
