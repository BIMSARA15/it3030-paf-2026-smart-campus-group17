import Dashboard from './pages/Dashboard';

import ResourceList from './pages/ResourceList';
import ResourceForm from './pages/ResourceForm';
import ResourceDetails from './pages/ResourceDetails';

function App() {
  return (
    <div>
      <Dashboard />
      <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ResourceList />} />
          <Route path="/resources/add" element={<ResourceForm />} />
          <Route path="/resources/:id" element={<ResourceDetails />} />
          <Route path="/resources/:id/edit" element={<ResourceForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
    </div>
    
  );
}

export default App;