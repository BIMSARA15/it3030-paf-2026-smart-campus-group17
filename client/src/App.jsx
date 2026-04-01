import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

function App() {
  const { user, login } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {/* If there is no user, show a login button. Otherwise, welcome them! */}
        {!user ? (
          <div style={{ padding: '20px' }}>
            <h2>Welcome to Smart Campus</h2>
            <button onClick={login}>Sign in with Google</button>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <h3>Welcome, {user.name}</h3>
            <img src={user.picture} alt="Profile" style={{ width: '50px', borderRadius: '50%' }} />
          </div>
        )}

        {/* ... keep your existing Routes down here ... */}
      </div>
    </Router>
  );
}

export default App;