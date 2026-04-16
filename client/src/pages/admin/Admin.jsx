import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} /> {/* User UI */}
          <Route path="/admin" element={<h2>Admin Workspace (Member 1 & 2)</h2>} />
          <Route path="/technician" element={<h2>Technician Workspace (Member 3)</h2>} />
          <Route path="/login" element={<h2>Global Login (You)</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;