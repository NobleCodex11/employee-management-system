import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [chartData, setChartData] = useState([]);

    const fetchData = async () => {
        try {
            const [staffRes, rolesRes, statsRes] = await Promise.all([
                api.get('staff/'),
                api.get('roles/'),
                api.get('dashboard/stats/')
            ]);
            setStaffList(staffRes.data);
            setRoles(rolesRes.data);
            setChartData(statsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalRevenue = chartData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
    const totalPatients = chartData.reduce((sum, item) => sum + item.patients, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Dashboard Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor clinic operations, revenue, and staff members.</p>
                </div>
            </div>

            <div className="grid-cards" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Patients</div>
                            <div className="stat-value">{totalPatients}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Staff</div>
                            <div className="stat-value">{staffList.length}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Active Doctors</div>
                            <div className="stat-value">
                                {staffList.filter(s => s.role === roles.find(r => r.role_name === 'Doctor')?.id && s.is_active).length}
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                            <Activity size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Daily Revenue & Patient Trends</h2>
                <div style={{ height: '400px', width: '100%' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" />
                                <YAxis yAxisId="left" stroke="var(--text-muted)" />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="patients" name="Patients Count" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            No data available yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Staff Members</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Joining Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => {
                                const roleName = roles.find(r => r.id === staff.role)?.role_name || 'Unknown';
                                return (
                                    <tr key={staff.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                                    {staff.full_name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{staff.full_name}</span>
                                            </div>
                                        </td>
                                        <td>{roleName}</td>
                                        <td>{staff.joining_date}</td>
                                        <td>
                                            <span className={`badge ${staff.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {staff.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
