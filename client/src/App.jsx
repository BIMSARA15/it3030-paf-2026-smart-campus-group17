import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import ResourceList from './pages/ResourceList';
import ResourceForm from './pages/ResourceForm';
import ResourceDetails from './pages/ResourceDetails';
import UtilityList from './pages/UtilityList';
import UtilityForm from './pages/UtilityForm';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<ResourceList />} />
        <Route path="/resources/new" element={<ResourceForm />} />
        <Route path="/resources/add" element={<Navigate to="/resources/new" replace />} />
        <Route path="/resources/:id" element={<ResourceDetails />} />
        <Route path="/resources/:id/edit" element={<ResourceForm />} />
        <Route path="/resources/edit/:id" element={<ResourceForm />} />
        <Route path="/utilities" element={<UtilityList />} />
        <Route path="/utilities/new" element={<UtilityForm />} />
      </Routes>
    </Layout>
  );
}

export default App;
