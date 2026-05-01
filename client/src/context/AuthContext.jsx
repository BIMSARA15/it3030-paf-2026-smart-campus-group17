import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {
  clearPreviewMode,
} from '../services/previewMode';


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
        
        if (!response.data || !response.data.email) {
            setUser(null);
            setLoading(false);
            return;
        }

       // 🛑 NEW USER: CATCH THE SESSION HOLD
       if (response.data.requiresRegistration) {
           setUser({
               name: response.data.name,
               email: response.data.email,
               picture: response.data.picture,
               requiresRegistration: true, // Tells your router they are partially logged in
               profileComplete: false
           });
           
          // If they aren't on the login page, send them there to finish!
           if (!window.location.pathname.includes('/login')) {
               window.location.href = '/login';
           }
       } else {
           // ✅ EXISTING USER: Normal login
           setUser({
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              picture: response.data.picture,
              role: response.data.role, 
              profileComplete: response.data.profileComplete
            });
            
            // Auto-redirect to the correct dashboard based on role!
            if (window.location.pathname === '/' || window.location.pathname === '/login') {
                const role = (response.data.role || 'student').toLowerCase();
                if (role === 'admin') window.location.href = '/admin';
                else if (role === 'technician') window.location.href = '/staff';
                else if (role === 'lecturer') window.location.href = '/lecturer';
                else window.location.href = '/student'; 
            }
       }
      }catch (error) {
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

  const logout = async () => {
    clearPreviewMode();
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};