import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Only importing Dashboard and Sidebar since those are the only files you have right now
import Dashboard from './pages/user/Dashboard';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Grab the user data and login function from your Auth context
  const { user, login } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      default: return 'Smart Campus';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // ---------------------------------------------------------
  // 1. IF NOT LOGGED IN: Show your simple login screen
  // ---------------------------------------------------------
  if (!user) {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#0f2b5b' }}>Welcome to Smart Campus</h2>
          <button 
            onClick={login}
            style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0f2b5b', color: 'white', border: 'none', borderRadius: '8px' }}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. IF LOGGED IN: Show teammate's layout (Sidebar + Header)
  // ---------------------------------------------------------
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Mobile Backdrop - hidden on medium/large screens */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main 
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          
          {/* Left Side: Title */}
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right Side: User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#0f2b5b] leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">
                {user.email || 'student@my.sliit.lk'}
              </p>
            </div>
            
            {/* Show Google picture if available, otherwise show initials */}
            {user.picture ? (
              <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full shadow-md object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0f2b5b] flex items-center justify-center flex-shrink-0 font-bold text-sm text-white shadow-md">
                {getInitials(user.name)}
              </div>
            )}
          </div>

        </header>

        {/* Routing Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto pb-10">
            <Routes>
              {/* Only the Dashboard route is kept here so your app doesn't crash! */}
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;