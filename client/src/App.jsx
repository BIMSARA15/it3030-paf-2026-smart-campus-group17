import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';

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
          {/* Public Route: Landing Page (Root URL) */}
          <Route 
            path="/" 
            element={user ? <Navigate to={
              user.role === 'ADMIN' ? '/admin' : 
              user.role === 'TECHNICIAN' ? '/technician' : '/dashboard'
            } replace /> : <Landing />} 
          />

          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={
              user.role === 'ADMIN' ? '/admin' : 
              user.role === 'TECHNICIAN' ? '/technician' : '/dashboard'
            } replace /> : <Login />} 
          />

          {/* === FIX: RESTORED DASHBOARD ROUTE === */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'STUDENT', 'LECTURER', 'ADMIN', 'TECHNICIAN']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
  path="/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['USER', 'STUDENT', 'LECTURER', 'ADMIN', 'TECHNICIAN']}>
      {/* If profile is incomplete, force them to the form. Otherwise, show dashboard */}
      {user?.profileComplete === false ? <Navigate to="/complete-profile" replace /> : <Dashboard />}
    </ProtectedRoute>
  } 
/>

<Route 
  path="/complete-profile" 
  element={
    <ProtectedRoute allowedRoles={['USER', 'STUDENT', 'LECTURER', 'ADMIN', 'TECHNICIAN']}>
      <CompleteProfile />
    </ProtectedRoute>
  } 
/>

          {/* Admin UI (Member 1 & 2 targets) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="p-8">
                  <h2>Admin Workspace (Only ADMINs can see this)</h2>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Technician UI (Member 3 target) */}
          <Route 
            path="/technician" 
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <div className="p-8">
                  <h2>Technician Workspace (Only TECHNICIANs can see this)</h2>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;