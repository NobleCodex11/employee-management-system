import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Calendar, Activity } from 'lucide-react';

const ReceptionDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0
    });

    const fetchData = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const [patientsRes, appointmentsRes] = await Promise.all([
                api.get('patients/'),
                api.get(`appointments/?date=${todayStr}`)
            ]);
            
            setStats({
                totalPatients: patientsRes.data.length,
                appointmentsToday: appointmentsRes.data.length
            });
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Reception Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome to the reception desk. Manage patients and appointments here.</p>
            </div>

            <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Patients</div>
                            <div className="stat-value">{stats.totalPatients}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Appointments Today</div>
                            <div className="stat-value">{stats.appointmentsToday}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <Activity size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3>Ready for the day!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Use the sidebar to add new patients or schedule appointments.</p>
            </div>
        </div>
    );
};

export default ReceptionDashboard;
