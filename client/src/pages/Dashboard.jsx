import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  // Grab the user data and the logout function from your context
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Smart Campus Operations Hub</h1>
      
      {/* If a user exists, show their info. Otherwise, tell them to log in. */}
      {user ? (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>Welcome back, {user.name}!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>System Role:</strong> <span style={{ color: user.role === 'ADMIN' ? 'red' : 'blue' }}>{user.role}</span></p>
          <button 
            onClick={logout}
            style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <h2>Please log in to access the system.</h2>
          {/* We will build the real login button here later */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;