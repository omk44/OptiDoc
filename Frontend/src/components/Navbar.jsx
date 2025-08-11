import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <nav className="bg-gray-900 text-white shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">OptiDoc</span>
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
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/doctors"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/doctors")
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  All Doctors
                </Link>
                <Link
                  to="/appointments"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/appointments")
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Appointments
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive("/admin-dashboard")
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/login")
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/signup")
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
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
                    <div className="text-sm text-gray-300">Welcome,</div>
                    <div className="text-sm font-semibold text-blue-400">{user.fullName || user.username}</div>
                  </div>
                  <div className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
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
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
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
