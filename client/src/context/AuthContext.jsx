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
    // When the app loads, ask Spring Boot if we are logged in
    const checkUserStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/user');
        // Google returns a lot of data, we just want the core info for now
        setUser({
          name: response.data.name,
          email: response.data.email,
          picture: response.data.picture,
          role: "USER" // We will pull this from MongoDB later
        });
      } catch (error) {
        ("Auth check failed:", error)
        // If it fails (e.g., 401 Unauthorized), the user is not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

// Accept the provider name ('google' or 'microsoft')
  const login = (provider) => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
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