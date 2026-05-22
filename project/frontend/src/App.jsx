import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/AdminDashboard';
import AdminStaffManagement from './pages/AdminStaffManagement';
import AdminSpecializations from './pages/AdminSpecializations';

import ReceptionDashboard from './pages/ReceptionDashboard';
import ReceptionPatients from './pages/ReceptionPatients';
import ReceptionAppointments from './pages/ReceptionAppointments';

import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyInventory from './pages/PharmacyInventory';
import PharmacyPrescriptions from './pages/PharmacyPrescriptions';

import DoctorDashboard from './pages/DoctorDashboard';
import DoctorLabTests from './pages/DoctorLabTests';

import LabTestManagement from './pages/LabTestManagement';
import LabEvaluations from './pages/LabEvaluations';

function AppRoutes() {
    return (
        <Routes>
            {/* Public Access Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Administrator Secured Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Administrator']}><Layout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="staff" element={<AdminStaffManagement />} />
                <Route path="departments" element={<AdminSpecializations />} />
            </Route>

            {/* Receptionist Secured Routes */}
            <Route path="/reception" element={<ProtectedRoute allowedRoles={['Receptionist', 'Administrator']}><Layout /></ProtectedRoute>}>
                <Route index element={<ReceptionDashboard />} />
                <Route path="patients" element={<ReceptionPatients />} />
                <Route path="appointments" element={<ReceptionAppointments />} />
            </Route>
            
            {/* Doctor Secured Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['Doctor']}><Layout /></ProtectedRoute>}>
                <Route index element={<DoctorDashboard />} />
                <Route path="lab-results" element={<DoctorLabTests />} />
            </Route>

            {/* Pharmacist Secured Routes */}
            <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={['Pharmacist', 'Administrator']}><Layout /></ProtectedRoute>}>
                <Route index element={<PharmacyDashboard />} />
                <Route path="inventory" element={<PharmacyInventory />} />
                <Route path="prescriptions" element={<PharmacyPrescriptions />} />
            </Route>

            {/* Lab Technician Secured Routes */}
            <Route path="/lab" element={<ProtectedRoute allowedRoles={['Lab Technician', 'Administrator']}><Layout /></ProtectedRoute>}>
                <Route index element={<LabTestManagement />} />
                <Route path="evaluations" element={<LabEvaluations />} />
            </Route>

            {/* Catch-all Wildcard Route for 404 Pages */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
