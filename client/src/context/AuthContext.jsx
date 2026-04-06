import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure Axios to always send cookies (session data) with requests
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // MOCK LOGIN FOR TESTING UI WITHOUT BACKEND
    setUser({
      id: "test-user-123", // Critical for MyBookings filter to work
      name: "Test Student",
      email: "student@campus.edu",
      department: "IT Department",
      role: "ADMIN" // Sets admin so you can test approving/rejecting
    });
    setLoading(false);
  }, []);
  
  const login = () => {
    // Redirect the browser to the Spring Boot Google Login URL
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const logout = async () => {
    // Optional: add a backend logout endpoint call here later
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};