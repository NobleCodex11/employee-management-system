import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Stethoscope, 
    Pill, 
    Microscope, 
    Building,
    LogOut,
    Menu
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <Icon size={20} />
        <span>{label}</span>
    </NavLink>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">C</div>
                    <h2>ClinicSys</h2>
                </div>

                <div style={{ flex: 1 }}>
                    {user?.role === 'Administrator' && (
                        <>
                            <SidebarLink to="/admin" icon={LayoutDashboard} label="Dashboard" />
                            <SidebarLink to="/admin/staff" icon={Users} label="Staff Management" />
                            <SidebarLink to="/admin/departments" icon={Building} label="Departments" />
                        </>
                    )}
                    
                    {user?.role === 'Receptionist' && (
                        <>
                            <SidebarLink to="/reception" icon={LayoutDashboard} label="Dashboard" />
                            <SidebarLink to="/reception/patients" icon={Users} label="Patients" />
                            <SidebarLink to="/reception/appointments" icon={Calendar} label="Appointments" />
                        </>
                    )}

                    {user?.role === 'Doctor' && (
                        <>
                            <SidebarLink to="/doctor" icon={Stethoscope} label="Consultations" />
                            <SidebarLink to="/doctor/lab-results" icon={Microscope} label="Lab Results" />
                        </>
                    )}

                    {user?.role === 'Pharmacist' && (
                        <>
                            <SidebarLink to="/pharmacy" icon={LayoutDashboard} label="Dashboard" />
                            <SidebarLink to="/pharmacy/inventory" icon={Pill} label="Inventory" />
                            <SidebarLink to="/pharmacy/prescriptions" icon={Stethoscope} label="Prescriptions" />
                        </>
                    )}

                    {user?.role === 'Lab Technician' && (
                        <>
                            <SidebarLink to="/lab" icon={LayoutDashboard} label="Lab Tests" />
                            <SidebarLink to="/lab/evaluations" icon={Microscope} label="Evaluations" />
                        </>
                    )}
                </div>

                <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                            <Menu size={20} style={{ color: 'var(--text-main)' }} />
                        </div>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1.1rem', letterSpacing: '0.02em' }}>Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name}</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                            {user?.role}
                        </span>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="content-area animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
