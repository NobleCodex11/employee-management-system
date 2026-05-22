import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Activity, Calendar, FileText, HeartPulse } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Administrator');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Completely wipe out previous stored browser data on login screen mount
    React.useEffect(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await login(username, password, role);
            
            // Route based on role
            if (role === 'Administrator') navigate('/admin');
            else if (role === 'Receptionist') navigate('/reception');
            else if (role === 'Doctor') navigate('/doctor');
            else if (role === 'Pharmacist') navigate('/pharmacy');
            else if (role === 'Lab Technician') navigate('/lab');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            
            {/* Left Side: Branding & Elements (Hidden on small screens) */}
            <div style={{ 
                flex: 1.2, 
                background: 'linear-gradient(135deg, var(--primary-light), var(--primary), var(--primary-hover))',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                color: 'white',
                overflow: 'hidden'
            }} className="login-branding">
                
                {/* Abstract Background Elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', top: '40%', right: '20%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', filter: 'blur(50px)' }}></div>

                <div style={{ zIndex: 1, maxWidth: '600px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                            C
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>ClinicSys</h1>
                    </div>

                    <h2 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                        Modernizing Healthcare Management.
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '4rem' }}>
                        A comprehensive, beautifully designed platform tailored for doctors, pharmacists, and administrators to deliver the best patient care.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {[
                            { icon: Calendar, title: 'Smart Scheduling', desc: 'Seamlessly manage patient queues.' },
                            { icon: FileText, title: 'Electronic Records', desc: 'Securely store clinical histories.' },
                            { icon: Activity, title: 'Live Dashboard', desc: 'Real-time analytics and insights.' },
                            { icon: HeartPulse, title: 'Integrated Care', desc: 'Connected pharmacy & labs.' },
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(10px)' }}>
                                    <item.icon size={24} color="white" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>{item.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem',
                position: 'relative'
            }}>
                <div className="animate-fade-in" style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '3rem',
                    background: 'var(--surface)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Please enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div className="input-group" style={{ margin: 0 }}>
                            <label className="input-label" style={{ fontWeight: '600' }}>Select Role</label>
                            <select 
                                className="input-field"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ cursor: 'pointer', appearance: 'none', background: 'var(--background)', fontWeight: '500' }}
                                disabled={loading}
                            >
                                <option>Administrator</option>
                                <option>Receptionist</option>
                                <option>Doctor</option>
                                <option>Pharmacist</option>
                                <option>Lab Technician</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ margin: 0 }}>
                            <label className="input-label" style={{ fontWeight: '600' }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <User size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    style={{ paddingLeft: '3.25rem', background: 'var(--background)' }}
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ margin: 0 }}>
                            <label className="input-label" style={{ fontWeight: '600' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    style={{ paddingLeft: '3.25rem', background: 'var(--background)' }}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%', 
                                marginTop: '1rem', 
                                height: '56px', 
                                fontSize: '1.1rem', 
                                borderRadius: '14px', 
                                letterSpacing: '0.02em', 
                                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                                opacity: loading ? 0.7 : 1,
                                pointerEvents: loading ? 'none' : 'auto'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In to ClinicSys'}
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Quick responsive styles for mobile */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 900px) {
                    .login-branding { display: none !important; }
                }
            `}} />
        </div>
    );
};

export default Login;
