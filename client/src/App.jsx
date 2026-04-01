import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

function App() {
  
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        {/* We will add a Global Navbar here later that shows for logged-in users */}
        
        <Routes>
          {/* Public Route: Landing Page */}
          <Route 
            path="/" 
            element={user ? <Navigate to={
              user.role === 'ADMIN' ? '/admin' : 
              user.role === 'TECHNICIAN' ? '/technician' : '/dashboard'
            } /> : <Landing />} 
          />

          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={
              user.role === 'ADMIN' ? '/admin' : 
              user.role === 'TECHNICIAN' ? '/technician' : '/dashboard'
            } /> : <Login />} 
          />

          {/* User UI (Member 2 & 3 targets) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin UI (Member 1 & 2 targets) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <h2>Admin Workspace (Only ADMINs can see this)</h2>
              </ProtectedRoute>
            } 
          />

          {/* Technician UI (Member 3 target) */}
          <Route 
            path="/technician" 
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <h2>Technician Workspace (Only TECHNICIANs can see this)</h2>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;