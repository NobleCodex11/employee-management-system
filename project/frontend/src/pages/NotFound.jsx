import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (!user) {
            navigate('/');
            return;
        }
        // Redirect to respective dashboards based on role
        if (user.role === 'Administrator') navigate('/admin');
        else if (user.role === 'Receptionist') navigate('/reception');
        else if (user.role === 'Doctor') navigate('/doctor');
        else if (user.role === 'Pharmacist') navigate('/pharmacy');
        else if (user.role === 'Lab Technician') navigate('/lab');
        else navigate('/');
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
                padding: '4rem 3rem',
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
                    background: 'rgba(79, 70, 229, 0.1)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                }}>
                    <AlertCircle size={36} strokeWidth={2} />
                </div>

                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                    404
                </h1>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                    Page Not Found
                </h2>

                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                    Oops! The page you are looking for does not exist or has been moved to another section.
                </p>

                <button onClick={handleGoHome} className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1.05rem', borderRadius: '12px' }}>
                    <Home size={18} /> Go Back Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
