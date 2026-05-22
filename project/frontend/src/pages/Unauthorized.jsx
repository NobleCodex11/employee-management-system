import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

const Unauthorized = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (!user) {
            navigate('/');
            return;
        }
        // Redirect to their respective dashboards based on role
        if (user.role === 'Administrator') navigate('/admin');
        else if (user.role === 'Receptionist') navigate('/reception');
        else if (user.role === 'Doctor') navigate('/doctor');
        else if (user.role === 'Pharmacist') navigate('/pharmacy');
        else if (user.role === 'Lab Technician') navigate('/lab');
        else navigate('/');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '2rem'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '3.5rem 3rem',
                textAlign: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
            }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    margin: '0 auto 2rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)'
                }}>
                    <ShieldAlert size={36} strokeWidth={2} />
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                    Access Denied
                </h1>

                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    You do not have the required permissions or credentials to access this dashboard. Please verify your role or sign in with another account.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={handleGoBack} className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1.05rem', borderRadius: '12px' }}>
                        <ArrowLeft size={18} /> Return to Dashboard
                    </button>
                    
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', height: '52px', fontSize: '1.05rem', borderRadius: '12px' }}>
                        <LogOut size={18} /> Log Out & Switch Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
