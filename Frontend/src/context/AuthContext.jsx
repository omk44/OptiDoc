import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage when app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login sets user and stores in localStorage
  const login = (userData) => {
    // Directly set the user object received from the backend.
    // The 'isLoggedIn' property is redundant as 'user' being non-null indicates login status.
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout clears user and localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
// 
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
