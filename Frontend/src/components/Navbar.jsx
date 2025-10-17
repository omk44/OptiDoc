import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import aboutImg from "../assets/about.png";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white shadow-2xl sticky top-0 z-50 border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">OptiDoc</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/")
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/doctors"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/doctors")
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  All Doctors
                </Link>
                <Link
                  to="/appointments"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/appointments")
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Appointments
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive("/admin-dashboard")
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === 'doctor' && (
                  <Link
                    to="/doctor-dashboard"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive("/doctor-dashboard")
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    Doctor Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/login")
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/signup")
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Welcome,</div>
                    <div className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{user.fullName || user.username}</div>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-semibold capitalize">
                    {user.role}
                  </div>
                </div>
                
                {/* Notifications */}
                <NotificationDropdown />
                
                <Link to="/profile" className="ml-2">
                  <img
                    src={aboutImg}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-blue-400 hover:scale-110 transition-transform shadow-lg hover:border-cyan-400"
                    title="Profile"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                Welcome to OptiDoc
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-sm border-t border-blue-800">
          {user ? (
            <>
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/doctors")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                All Doctors
              </Link>
              <Link
                to="/appointments"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/appointments")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Appointments
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/admin-dashboard")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}
              {user.role === 'doctor' && (
                <Link
                  to="/doctor-dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/doctor-dashboard")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  Doctor Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/login")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/signup")
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
