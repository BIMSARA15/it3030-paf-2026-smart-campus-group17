import { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create a custom hook so your team can easily use it
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  // For now, we use a "mock" user so your team can test their modules.
  // Once your Spring Boot backend is ready, we will replace this with real data.
  const [user, setUser] = useState({
    id: "65f1a2b3c4d5e6f7a8b9c0d1", // Fake MongoDB ID
    name: "Test User",
    email: "test@my.sliit.lk",
    role: "USER" // Change to "ADMIN" to test admin features
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};