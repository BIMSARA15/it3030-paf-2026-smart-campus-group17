import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login'; 
import CompleteProfile from './pages/CompleteProfile';

// ------------------------------------------------------------------------
// TEAM INSTRUCTIONS: 
// When you pull this branch, uncomment your import below and replace the 
// placeholder <div> tags in the Routes with your actual component!
// ------------------------------------------------------------------------
// import AdminDashboard from './pages/admin/AdminDashboard';
// import StaffDashboard from './pages/staff/StaffDashboard';
// import LecturerDashboard from './pages/user/LecturerDashboard';
// import StudentDashboard from './pages/user/StudentDashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  }

  // Smart Routing Helper: Determines where a logged-in user belongs
  const getDashboardRoute = (role) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'TECHNICIAN') return '/staff';
    if (role === 'LECTURER') return '/lecturer';
    return '/student'; // Default for STUDENT or USER
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Route: Landing Page */}
          <Route 
            path="/" 
            element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Landing />} 
          />

          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Login />} 
          />

          <Route 
            path="/complete-profile" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'STUDENT', 'LECTURER', 'ADMIN', 'TECHNICIAN']}>
                <CompleteProfile />
              </ProtectedRoute>
            } 
          />

          {/* ========================================== */}
          {/* TEAM DASHBOARD ROUTES (PLACEHOLDERS)         */}
          {/* ========================================== */}

          {/* Member 1 & 2: Admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="p-8 bg-slate-50 min-h-screen">
                  <h2 className="text-2xl font-bold">Admin Dashboard Placeholder</h2>
                  <p className="text-slate-500">Create your page in the <b>/pages/admin/</b> folder and import it here.</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Member 3: Staff / Technician */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <div className="p-8 bg-slate-50 min-h-screen">
                  <h2 className="text-2xl font-bold">Staff Dashboard Placeholder</h2>
                  <p className="text-slate-500">Create your page in the <b>/pages/staff/</b> folder and import it here.</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* User Folder: Lecturer */}
          <Route 
            path="/lecturer" 
            element={
              <ProtectedRoute allowedRoles={['LECTURER']}>
                {user?.profileComplete === false ? <Navigate to="/complete-profile" replace /> : (
                  <div className="p-8 bg-slate-50 min-h-screen">
                    <h2 className="text-2xl font-bold">Lecturer Dashboard Placeholder</h2>
                    <p className="text-slate-500">Create your page in the <b>/pages/user/</b> folder and import it here.</p>
                  </div>
                )}
              </ProtectedRoute>
            } 
          />

          {/* User Folder: Student */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER']}>
                 {user?.profileComplete === false ? <Navigate to="/complete-profile" replace /> : (
                  <div className="p-8 bg-slate-50 min-h-screen">
                    <h2 className="text-2xl font-bold">Student Dashboard Placeholder</h2>
                    <p className="text-slate-500">Create your page in the <b>/pages/user/</b> folder and import it here.</p>
                  </div>
                )}
              </ProtectedRoute>
            } 
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;