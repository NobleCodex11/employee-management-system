import React, { useState, useEffect } from 'react';
import api from '../api';
import { CalendarPlus, X } from 'lucide-react';

const ReceptionAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        appointment_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
        token_number: 1,
        consultation_status: 'Scheduled',
        patient: '',
        specialization: '',
        doctor: ''
    });

    const fetchData = async () => {
        try {
            const [apptsRes, patientsRes, docsRes, specRes] = await Promise.all([
                api.get('appointments/'),
                api.get('patients/'),
                api.get('doctors/'),
                api.get('specializations/')
            ]);
            setAppointments(apptsRes.data);
            setPatients(patientsRes.data);
            setDoctors(docsRes.data);
            setSpecializations(specRes.data);
            
            // Auto-calculate the next token number based on the highest existing token
            const nextToken = apptsRes.data.length > 0 
                ? Math.max(...apptsRes.data.map(a => a.token_number)) + 1 
                : 1;

            if (patientsRes.data.length > 0 && docsRes.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    patient: patientsRes.data[0].id,
                    doctor: docsRes.data[0].id,
                    token_number: nextToken
                }));
            } else {
                setFormData(prev => ({ ...prev, token_number: nextToken }));
            }
        } catch (err) {
            console.error("Failed to fetch appointment data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'specialization') {
            setFormData({ ...formData, specialization: value, doctor: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const filteredDoctors = formData.specialization 
        ? doctors.filter(d => String(d.specialization) === String(formData.specialization))
        : doctors;

    const handlePayBill = async (appointmentId) => {
        try {
            await api.post(`appointments/${appointmentId}/pay-bill/`);
            fetchData();
        } catch (err) {
            console.error("Failed to collect payment", err);
            alert("Error collecting payment");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('appointments/', formData);
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to schedule appointment", err);
            alert("Error scheduling appointment");
        }
    };

    const openModal = () => {
        const nextToken = appointments.length > 0 
            ? Math.max(...appointments.map(a => a.token_number)) + 1 
            : 1;
        
        setFormData(prev => ({ ...prev, token_number: nextToken }));
        setShowModal(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Appointment Scheduling</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage patient appointments with doctors.</p>
                </div>
                <button className="btn btn-primary" onClick={openModal}>
                    <CalendarPlus size={18} /> Schedule Appointment
                </button>
            </div>

            <div className="glass-panel">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Token</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Status</th>
                                <th>Bill Details</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No appointments scheduled</td></tr>
                            ) : appointments.map(appt => (
                                <tr key={appt.id}>
                                    <td>{new Date(appt.appointment_date).toLocaleString()}</td>
                                    <td>#{appt.token_number}</td>
                                    <td style={{ fontWeight: 500 }}>{appt.patient_details?.patient_name || 'Unknown'}</td>
                                    <td>{appt.doctor_details?.staff_details?.full_name ? `Dr. ${appt.doctor_details.staff_details.full_name}` : 'Unknown'}</td>
                                    <td>
                                        <span className={`badge ${appt.consultation_status === 'Scheduled' ? 'badge-success' : 'badge-danger'}`}>
                                            {appt.consultation_status}
                                        </span>
                                    </td>
                                    <td>
                                        {appt.bill_amount > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '600' }}>${appt.bill_amount.toFixed(2)}</span>
                                                <span className={`badge ${appt.bill_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                                    {appt.bill_status}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No Bill</span>
                                        )}
                                    </td>
                                    <td>
                                        {appt.bill_amount > 0 && appt.bill_status === 'Unpaid' ? (
                                            <button 
                                                onClick={() => handlePayBill(appt.id)} 
                                                className="btn btn-primary" 
                                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                            >
                                                Collect Payment
                                            </button>
                                        ) : appt.bill_amount > 0 && appt.bill_status === 'Paid' ? (
                                            <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '500' }}>Payment Received</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Schedule Appointment Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Schedule Appointment</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Patient</label>
                                <select name="patient" className="input-field" value={formData.patient} onChange={handleInputChange} required>
                                    <option value="" disabled>Select Patient</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.patient_name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Department</label>
                                    <select name="specialization" className="input-field" value={formData.specialization} onChange={handleInputChange} required>
                                        <option value="" disabled>Select Department</option>
                                        {specializations.map(s => (
                                            <option key={s.id} value={s.id}>{s.specialization_name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Doctor</label>
                                    <select name="doctor" className="input-field" value={formData.doctor} onChange={handleInputChange} required disabled={!formData.specialization}>
                                        <option value="" disabled>Select Doctor</option>
                                        {filteredDoctors.map(d => (
                                            <option key={d.id} value={d.id}>Dr. {d.staff_details?.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 2 }}>
                                    <label className="input-label">Date & Time</label>
                                    <input type="datetime-local" name="appointment_date" className="input-field" value={formData.appointment_date} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Token #</label>
                                    <input type="number" name="token_number" className="input-field" value={formData.token_number} onChange={handleInputChange} required min="1" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Confirm Appointment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionAppointments;
