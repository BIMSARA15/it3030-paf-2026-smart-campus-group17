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
import AdminDashboard from './pages/admin/AdminDashboard';
import AllBookings from './pages/admin/AllBookings';
import AdminResources from './pages/admin/Resources';
import AdminUtilities from './pages/admin/Utilities';
//import StaffDashboard from './pages/staff/StaffDashboard';
import LecturerDashboard from './pages/user/LecturerDashboard';
import StudentDashboard from './pages/user/StudentDashboard';
import NewBooking from './pages/user/NewBooking';
import MyBookings from './pages/user/MyBookings';
import Resources from './pages/user/Resources';
import StudentRequests from './pages/user/StudentRequests';

function App() {
  const { user, loading, logout } = useAuth();

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
          {/* Public Route: Landing Page */}
          <Route 
            path="/" 
            element={(user && !user.requiresRegistration) ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Landing />} 
          />

          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={(user && !user.requiresRegistration) ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Login />} 
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
                <AdminDashboard />
            </ProtectedRoute>
          } 
          />

          <Route 
           path="/admin/bookings" 
           element={
             <ProtectedRoute allowedRoles={['ADMIN']}>
                <AllBookings />
            </ProtectedRoute>
          } 
          />

          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminResources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/utilities"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUtilities />
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
                  <button 
                    onClick={logout} 
                    className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Log Out to Landing Page
                  </button>
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
                  <LecturerDashboard />
                )}
              </ProtectedRoute>
            } 
          />

          <Route
            path="/lecturer/requests"
            element={
              <ProtectedRoute allowedRoles={['LECTURER']}>
                <StudentRequests />
              </ProtectedRoute>
            }
          />

          {/* User Folder: Student */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER']}>
                 {user?.profileComplete === false ? (
                   <Navigate to="/complete-profile" replace /> 
                 ) : (
                   <StudentDashboard />
                 )}
              </ProtectedRoute>
            } 
          />

          {/* ========================================== */}
          {/* AUXILIARY PAGES (Bookings & Resources)       */}
          {/* ========================================== */}
          
          <Route 
            path="/booking/new" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER', 'LECTURER', 'ADMIN']}>
                <NewBooking />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/bookings/my" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER', 'LECTURER', 'ADMIN']}>
                <MyBookings />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/resources" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER', 'LECTURER', 'ADMIN', 'TECHNICIAN']}>
                <Resources />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
