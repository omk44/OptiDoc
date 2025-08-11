// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  console.log("ProtectedRoute: Current user:", user);
  console.log("ProtectedRoute: User role:", user?.role);
  console.log("ProtectedRoute: Allowed roles:", allowedRoles);

  // If no user is logged in, redirect to the login page
  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles are specified AND the user's role is NOT in the allowedRoles array,
  // redirect them.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`ProtectedRoute: Access Denied! User role '${user.role}' is not in allowed roles: ${allowedRoles.join(', ')}. Redirecting to /`);
    return <Navigate to="/" replace />; // Redirect to home or an unauthorized page
  }

  // If the user is logged in and their role is allowed, render the child routes.
  console.log("ProtectedRoute: Access Granted for role:", user.role);
  return <Outlet />;
}

export default ProtectedRoute;
