import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Register } from './pages/Register';
import { ContactUs } from './pages/ContactUs';
import { Layout } from './components/Layout';
import { Role } from './types';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard'; // Switched to Dashboard
import { AdminRegistered } from './pages/admin/AdminRegistered';
import { AdminIssuance } from './pages/admin/AdminIssuance';
import { AdminBenefits } from './pages/admin/AdminBenefits';
import { AdminPhilHealth } from './pages/admin/AdminPhilHealth';
import { Masterlist } from './pages/admin/Masterlist';
import { LcrPwdDashboard } from './pages/admin/LcrPwdDashboard';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenComplaints } from './pages/citizen/CitizenComplaints';
import { CitizenID } from './pages/citizen/CitizenID';
import { CitizenBenefits } from './pages/citizen/CitizenBenefits';
import { CitizenProfile } from './pages/citizen/CitizenProfile';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: Role }> = ({ children, allowedRole }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    if (currentUser.role === Role.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Route wrapper to prevent logged-in users from seeing Landing/Login pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  if (currentUser) {
    if (currentUser.role === Role.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><ContactUs /></PublicRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/masterlist" element={<ProtectedRoute allowedRole={Role.ADMIN}><Masterlist /></ProtectedRoute>} />
      <Route path="/admin/registry" element={<ProtectedRoute allowedRole={Role.ADMIN}><LcrPwdDashboard /></ProtectedRoute>} />
      
      {/* Registered Menu Routes */}
      <Route path="/admin/registered/:tab" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminRegistered /></ProtectedRoute>} />
      
      {/* ID Issuance Menu Routes */}
      <Route path="/admin/id/:tab" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminIssuance /></ProtectedRoute>} />
      
      {/* Benefits Menu Routes */}
      <Route path="/admin/benefits/:tab" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminBenefits /></ProtectedRoute>} />
      
      {/* PhilHealth */}
      <Route path="/admin/philhealth" element={<ProtectedRoute allowedRole={Role.ADMIN}><AdminPhilHealth /></ProtectedRoute>} />
      
      {/* Redirect old reports route for safety */}
      <Route path="/admin/reports" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Citizen Routes */}
      <Route path="/citizen/dashboard" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/complaints" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenComplaints /></ProtectedRoute>} />
      <Route path="/citizen/id" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenID /></ProtectedRoute>} />
      <Route path="/citizen/benefits" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenBenefits /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute allowedRole={Role.CITIZEN}><CitizenProfile /></ProtectedRoute>} />

      {/* Catch-all route for 404s - Redirect to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;