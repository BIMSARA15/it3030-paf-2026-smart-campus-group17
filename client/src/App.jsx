import { useState } from 'react'; //state hook to manage the sidebar open/close state
import { Routes, Route, useLocation } from 'react-router-dom'; //react-router-dom hooks for routing and location tracking
import { useAuth } from './context/AuthContext'; // <-- Imported useAuth to access user data for the header

import Dashboard from './pages/user/Dashboard';
import NewBooking from './pages/user/NewBooking';
import MyBookings from './pages/user/MyBookings';
import Resources from './pages/user/Resources';
import AllBookings from './pages/admin/AllBookings';

import Sidebar from './components/Sidebar'; 

function App() { //main App component that sets up the layout and routing for the application
  // It's usually better to default to 'true' for desktop views
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const location = useLocation();
  
  // Grab the user data to display in the header
  const { user } = useAuth();

  const getPageTitle = () => { //event handler to set the page title based on the current route
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/booking/new': return 'New Booking';
      case '/bookings/my': return 'My Bookings';
      case '/resources': return 'Resources';
      case '/bookings/all': return 'All Bookings';
      default: return 'Smart Campus';
    }
  };

  // Helper to extract initials for the avatar
  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Mobile Backdrop - hidden on medium/large screens */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity cursor-pointer"
          onClick={() => setIsSidebarOpen(false)} //state handler to close the sidebar when the backdrop is clicked
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main 
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        
        {/* Updated Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          
          {/* Left Side: Title (Hamburger Menu Removed) */}
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right Side: User Profile */}
          <div className="flex items-center gap-3">
            {/* Hidden on very small screens to save space */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#0f2b5b] leading-tight">
                {user?.name || 'Chathurya'}
              </p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">
                {user?.email || 'it23345478@my.sliit.lk'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#0f2b5b] flex items-center justify-center flex-shrink-0 font-bold text-sm text-white shadow-md">
              {getInitials(user?.name || 'Chathurya')}
            </div>
          </div>

        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto pb-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/booking/new" element={<NewBooking />} />
              <Route path="/bookings/my" element={<MyBookings />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/bookings/all" element={<AllBookings />} />
              
            </Routes>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;