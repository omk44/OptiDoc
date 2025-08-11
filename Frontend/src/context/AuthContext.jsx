import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and verify with backend
  useEffect(() => {
    const restoreUser = async () => {
      const savedUser = localStorage.getItem('optidoc_user');
      if (!savedUser) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        if (!(parsedUser && parsedUser._id && parsedUser.role)) {
          localStorage.removeItem('optidoc_user');
          setLoading(false);
          return;
        }

        // Verify user still exists in DB
        const params = new URLSearchParams({ id: parsedUser._id, role: parsedUser.role });
        const res = await fetch(`http://localhost:5000/api/auth/me?${params.toString()}`);
        if (!res.ok) {
          // Clear invalid session
          localStorage.removeItem('optidoc_user');
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error restoring user from backend:', error);
        localStorage.removeItem('optidoc_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('optidoc_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('optidoc_user');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
