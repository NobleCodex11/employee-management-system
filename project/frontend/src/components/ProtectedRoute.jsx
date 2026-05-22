import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // While context loading state is active, render a beautiful glassmorphic loader
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--background)'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '2.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(79, 70, 229, 0.1)',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading ClinicSys...</span>
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}} />
                </div>
            </div>
        );
    }

    // Redirect to login if user is not authenticated
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Redirect to unauthorized page if role is not allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
