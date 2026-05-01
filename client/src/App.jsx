import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import FacilitiesAssets from './pages/staff/FacilitiesAssets';
// Module C — Maintenance & Incident Ticketing (Technician)
import TechnicianDashboard from './pages/staff/TechnicianDashboard';
import TechnicianMaintenance from './pages/staff/TechnicianMaintenance';
import Maintenance from './pages/user/Maintenance';
import AIChat from './components/AIChat';

// ------------------------------------------------------------------------
// TEAM INSTRUCTIONS:
// When you pull this branch, uncomment your import below and replace the
// placeholder <div> tags in the Routes with your actual component!
// ------------------------------------------------------------------------
import AdminDashboard from './pages/admin/AdminDashboard';
import AllBookings from './pages/admin/AllBookings';
import AdminResources from './pages/admin/Resources';
import AdminUtilities from './pages/admin/Utilities';
import AdminTechnicians from './pages/admin/AdminTechnicians';
import VerifyBooking from './pages/admin/VerifyBooking';

import LecturerDashboard from './pages/user/LecturerDashboard';
import StudentDashboard from './pages/user/StudentDashboard';
import NewBooking from './pages/user/NewBooking';
import MyBookings from './pages/user/MyBookings';
import Resources from './pages/user/Resources';
import StudentRequests from './pages/user/StudentRequests';

// --- IMPORT FOR NOTIFICATIONS ---
import Notifications from './pages/Notifications';

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
            element={(user && !user.requiresRegistration) ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Landing />} 
          />

          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={(user && !user.requiresRegistration) ? <Navigate to={getDashboardRoute(user.role)} replace /> : <Login />} 
          />

          {/* ========================================== */}
          {/* TEAM DASHBOARD ROUTES                      */}
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

          <Route path="/admin/verify/:id" element={<VerifyBooking />} />

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
          <Route 
            path="/admin/technicians" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTechnicians />
              </ProtectedRoute>
            }
          />

          {/* Member 3: Staff / Technician — Module C */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/maintenance"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechnicianMaintenance />
              </ProtectedRoute>
            }
          />
          <Route path="/staff/facilities" element={<ProtectedRoute allowedRoles={['TECHNICIAN']}><FacilitiesAssets /></ProtectedRoute>} />
         {/* User Folder: Lecturer */}
        <Route 
            path="/lecturer" 
            element={
              <ProtectedRoute allowedRoles={['LECTURER']}>
                  <LecturerDashboard />
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
                  <StudentDashboard />
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

          {/* Edit Booking Route */}
          <Route 
            path="/booking/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER', 'LECTURER', 'ADMIN']}>
                <NewBooking />
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

          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER', 'LECTURER', 'ADMIN']}>
                <Maintenance />
              </ProtectedRoute>
            }
          />

          {/* --- ROUTE FOR NOTIFICATIONS PAGE --- */}
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'USER', 'LECTURER', 'ADMIN', 'TECHNICIAN', 'MERCHANT']}>
                <Notifications />
              </ProtectedRoute>
            }
          />

        </Routes>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;