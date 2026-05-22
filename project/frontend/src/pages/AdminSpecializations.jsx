import React, { useState, useEffect } from 'react';
import api from '../api';
import { Building, Plus, X, Edit2, Trash2 } from 'lucide-react';

const AdminSpecializations = () => {
    const [specializations, setSpecializations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSpec, setEditingSpec] = useState(null);
    const [formData, setFormData] = useState({ specialization_name: '' });

    const fetchData = async () => {
        try {
            const res = await api.get('specializations/');
            setSpecializations(res.data);
        } catch (err) {
            console.error("Failed to fetch specializations", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setEditingSpec(null);
        setFormData({ specialization_name: '' });
        setShowModal(true);
    };

    const openEditModal = (spec) => {
        setEditingSpec(spec);
        setFormData({ specialization_name: spec.specialization_name });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSpec) {
                await api.patch(`specializations/${editingSpec.id}/`, formData);
            } else {
                await api.post('specializations/', formData);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save specialization", err);
            alert("Error saving specialization");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                await api.delete(`specializations/${id}/`);
                fetchData();
            } catch (err) {
                console.error("Failed to delete specialization", err);
                alert("Error deleting specialization");
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Departments</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage clinic departments and specializations.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> Add Department
                </button>
            </div>

            <div className="glass-panel">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Department Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {specializations.length === 0 ? (
                                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>No departments found</td></tr>
                            ) : specializations.map(spec => (
                                <tr key={spec.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                                <Building size={16} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{spec.specialization_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openEditModal(spec)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(spec.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none' }}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
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
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>{editingSpec ? 'Edit Department' : 'Add Department'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Department Name</label>
                                <input type="text" name="specialization_name" className="input-field" value={formData.specialization_name} onChange={handleInputChange} required autoFocus />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                {editingSpec ? 'Update Department' : 'Save Department'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSpecializations;
