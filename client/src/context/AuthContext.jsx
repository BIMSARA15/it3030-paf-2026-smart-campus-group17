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
    const checkUserStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/user');
        
        if (!response.data || !response.data.email) {
            setUser(null);
            setLoading(false);
            return;
        }

       // 🛑 CATCH THE SESSION HOLD
       if (response.data.requiresRegistration) {
           setUser({
               name: response.data.name,
               email: response.data.email,
               picture: response.data.picture,
               requiresRegistration: true, // Tells your router they are partially logged in
               profileComplete: false
           });
       } else {
           // Normal login
           setUser({
              name: response.data.name,
              email: response.data.email,
              picture: response.data.picture,
              role: response.data.role, 
              profileComplete: response.data.profileComplete
            });
       }
      } catch (error) {
        console.error("Auth check failed:", error);
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
  // NEW: Developer Quick Login Bypass
  // NEW: Developer Quick Login Bypass
  const devLogin = async (role) => {
    try {
      await axios.get(`http://localhost:8080/api/auth/dev-login/${role}`);
      
      // Force a page reload and route to their specific team folders!
      if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'technician') {
        window.location.href = '/staff'; // Technician goes to Staff folder
      } else if (role === 'lecturer') {
        window.location.href = '/lecturer';
      } else {
        window.location.href = '/student'; // Default student dashboard
      }
      
    } catch (error) {
      console.error("Dev login failed:", error);
    }
  };

  const logout = async () => {
    try {
      // Tell Spring Boot to destroy the session cookie
      await axios.post('http://localhost:8080/logout'); 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear the React state and send them to the Landing page
      setUser(null);
      window.location.href = '/'; 
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, devLogin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};