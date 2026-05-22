import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, X } from 'lucide-react';

const ReceptionPatients = () => {
    const [patients, setPatients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        patient_name: '',
        date_of_birth: '',
        gender: 'Male',
        mobile_number: '',
        address: ''
    });

    const fetchPatients = async () => {
        try {
            const res = await api.get('patients/');
            setPatients(res.data);
        } catch (err) {
            console.error("Failed to fetch patients", err);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('patients/', formData);
            setShowModal(false);
            setFormData({ patient_name: '', date_of_birth: '', gender: 'Male', mobile_number: '', address: '' });
            fetchPatients();
        } catch (err) {
            console.error("Failed to add patient", err);
            alert("Error adding patient");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Patient Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Register and manage clinic patients.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> Register Patient
                </button>
            </div>

            <div className="glass-panel">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>DOB</th>
                                <th>Gender</th>
                                <th>Mobile</th>
                                <th>Address</th>
                                <th>Total Billed</th>
                                <th>Outstanding</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No patients found</td></tr>
                            ) : patients.map(patient => (
                                <tr key={patient.id}>
                                    <td style={{ fontWeight: 500 }}>{patient.patient_name}</td>
                                    <td>{patient.date_of_birth}</td>
                                    <td>{patient.gender}</td>
                                    <td>{patient.mobile_number}</td>
                                    <td>{patient.address}</td>
                                    <td style={{ fontWeight: 600 }}>${(patient.total_bill || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${patient.outstanding_bill > 0 ? 'badge-warning' : 'badge-success'}`}>
                                            ${(patient.outstanding_bill || 0).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Patient Modal */}
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
                            <h2 style={{ margin: 0 }}>Register New Patient</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Patient Name</label>
                                <input type="text" name="patient_name" className="input-field" value={formData.patient_name} onChange={handleInputChange} required />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Date of Birth</label>
                                    <input type="date" name="date_of_birth" className="input-field" value={formData.date_of_birth} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Gender</label>
                                    <select name="gender" className="input-field" value={formData.gender} onChange={handleInputChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Mobile Number</label>
                                <input type="text" name="mobile_number" className="input-field" value={formData.mobile_number} onChange={handleInputChange} required />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Address</label>
                                <textarea name="address" className="input-field" rows="3" value={formData.address} onChange={handleInputChange} required></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Save Patient
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionPatients;
