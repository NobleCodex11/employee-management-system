import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
    Calendar, Clock, User, Activity, FileText, Pill, 
    Microscope, History, Plus, Save, X, ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [doctor, setDoctor] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [labTests, setLabTests] = useState([]);
    
    // View state
    const [activeTab, setActiveTab] = useState('Today');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [consultationTab, setConsultationTab] = useState('Notes');

    // Data for selected consultation
    const [consultation, setConsultation] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTestPrescriptions, setLabTestPrescriptions] = useState([]);
    
    // History data
    const [patientHistory, setPatientHistory] = useState({
        consultations: [],
        prescriptions: [],
        labTests: []
    });

    // Forms
    const [consultationForm, setConsultationForm] = useState({ symptoms: '', diagnosis: '', notes: '' });
    const [prescriptionForm, setPrescriptionForm] = useState({ medicine: '', dosage: '', frequency: '', duration: '' });
    const [labForm, setLabForm] = useState({ lab_test: '', remarks: '' });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const docsRes = await api.get('doctors/');
                const currentDoc = docsRes.data.find(d => String(d.staff) === String(user.id) || String(d.staff_details?.id) === String(user.id));
                setDoctor(currentDoc);

                if (currentDoc) {
                    const [apptsRes, medsRes, testsRes] = await Promise.all([
                        api.get(`appointments/doctor/${currentDoc.id}/`),
                        api.get('medicines/'),
                        api.get('labtests/')
                    ]);
                    const sortedAppts = apptsRes.data.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
                    setAppointments(sortedAppts);
                    setMedicines(medsRes.data.filter(m => m.is_active));
                    setLabTests(testsRes.data.filter(t => t.is_active));
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };
        fetchInitialData();
    }, [user]);

    const openConsultation = async (appt) => {
        setSelectedAppointment(appt);
        setConsultationTab('Notes');
        setConsultationForm({ symptoms: '', diagnosis: '', notes: '' });
        
        try {
            try {
                const consRes = await api.get(`consultations/appointment/${appt.id}/`);
                if (consRes.data && !consRes.data.error) {
                    setConsultation(consRes.data);
                    setConsultationForm({
                        symptoms: consRes.data.symptoms,
                        diagnosis: consRes.data.diagnosis,
                        notes: consRes.data.notes
                    });
                }
            } catch (e) {
                setConsultation(null);
            }

            const [presRes, labRes] = await Promise.all([
                api.get(`prescriptions/medicine/appointment/${appt.id}/`),
                api.get(`prescriptions/labtest/appointment/${appt.id}/`)
            ]);
            setPrescriptions(presRes.data);
            setLabTestPrescriptions(labRes.data);

            const [histCons, histPres, histLab] = await Promise.all([
                api.get(`consultations/patient/${appt.patient}/`),
                api.get(`prescriptions/medicine/patient/${appt.patient}/`),
                api.get(`prescriptions/labtest/patient/${appt.patient}/`)
            ]);
            
            setPatientHistory({
                consultations: histCons.data.filter(c => c.appointment !== appt.id),
                prescriptions: histPres.data.filter(p => p.appointment !== appt.id),
                labTests: histLab.data.filter(l => l.appointment !== appt.id)
            });

        } catch (err) {
            console.error("Failed to load consultation data", err);
        }
    };

    const saveConsultation = async (e) => {
        e.preventDefault();
        try {
            if (consultation) {
                const res = await api.patch(`consultations/${consultation.id}/`, consultationForm);
                setConsultation(res.data);
            } else {
                const payload = { ...consultationForm, appointment: selectedAppointment.id };
                const res = await api.post('consultations/', payload);
                setConsultation(res.data);
                await api.patch(`appointments/${selectedAppointment.id}/`, { consultation_status: 'Completed' });
                const apptsRes = await api.get(`appointments/doctor/${doctor.id}/`);
                setAppointments(apptsRes.data);
            }
            alert("Consultation saved successfully!");
        } catch (err) {
            console.error("Failed to save consultation", err);
            alert("Error saving consultation");
        }
    };

    const addPrescription = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...prescriptionForm, appointment: selectedAppointment.id };
            const res = await api.post('prescriptions/medicine/', payload);
            setPrescriptions([...prescriptions, res.data]);
            setPrescriptionForm({ medicine: '', dosage: '', frequency: '', duration: '' });
        } catch (err) {
            console.error("Failed to add prescription", err);
        }
    };

    const addLabTest = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...labForm, appointment: selectedAppointment.id };
            const res = await api.post('prescriptions/labtest/', payload);
            setLabTestPrescriptions([...labTestPrescriptions, res.data]);
            setLabForm({ lab_test: '', remarks: '' });
        } catch (err) {
            console.error("Failed to add lab test", err);
        }
    };

    const todayAppointments = appointments.filter(a => {
        const apptDate = new Date(a.appointment_date);
        const today = new Date();
        return apptDate.getDate() === today.getDate() && 
               apptDate.getMonth() === today.getMonth() && 
               apptDate.getFullYear() === today.getFullYear();
    });
    const displayedAppointments = activeTab === 'Today' ? todayAppointments : appointments;

    // Premium Light Theme Setup via CSS Variables specific to this component scope
    const themeVariables = {
        '--doc-primary': '#4F46E5',
        '--doc-primary-light': '#818CF8',
        '--doc-primary-dark': '#4338CA',
        '--doc-bg': '#FFFFFF',
    };

    return (
        <div style={themeVariables}>
            {!selectedAppointment ? (
                <div className="animate-fade-in">
                    {/* Hero Header */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.1))',
                        border: '1px solid rgba(79, 70, 229, 0.2)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(79, 70, 229,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ color: 'var(--primary)', fontSize: '2.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '700' }}>
                                <Activity size={48} strokeWidth={2.5} />
                                Doctor Workspace
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.75rem', maxWidth: '600px' }}>
                                Welcome back, Dr. {user.username}. Here is your schedule for {activeTab === 'Today' ? 'today' : 'all time'}.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)', zIndex: 1 }}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{todayAppointments.length}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: '500', marginTop: '0.25rem' }}>Appointments Today</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button 
                            className="btn" 
                            style={{ 
                                background: activeTab === 'Today' ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(79, 70, 229, 0.05)',
                                color: activeTab === 'Today' ? 'white' : 'var(--text-main)',
                                border: activeTab === 'Today' ? 'none' : '1px solid var(--border)',
                                padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600'
                            }} 
                            onClick={() => setActiveTab('Today')}
                        >
                            <Calendar size={18} /> Today's Queue
                        </button>
                        <button 
                            className="btn" 
                            style={{ 
                                background: activeTab === 'History' ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(79, 70, 229, 0.05)',
                                color: activeTab === 'History' ? 'white' : 'var(--text-main)',
                                border: activeTab === 'History' ? 'none' : '1px solid var(--border)',
                                padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600'
                            }} 
                            onClick={() => setActiveTab('History')}
                        >
                            <History size={18} /> All Appointments
                        </button>
                    </div>

                    {/* Cards Grid instead of Table */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {displayedAppointments.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(79, 70, 229, 0.02)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                <CheckCircle size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                <h3 style={{ color: 'var(--text-muted)' }}>No appointments scheduled</h3>
                            </div>
                        ) : displayedAppointments.map(appt => (
                            <div key={appt.id} className="glass-panel" style={{ 
                                padding: '1.5rem', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '20px',
                                display: 'flex', flexDirection: 'column',
                                position: 'relative', overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = 'var(--primary-light)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                            onClick={() => openConsultation(appt)}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: appt.consultation_status === 'Completed' ? 'var(--success)' : 'var(--warning)' }}></div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
                                    <span style={{ color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', background: 'rgba(79, 70, 229, 0.08)', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>
                                        <Clock size={16} /> {new Date(appt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    <span className={`badge ${appt.consultation_status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem' }}>
                                        Token #{appt.token_number}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)' }}>
                                        {appt.patient_details?.patient_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{appt.patient_details?.patient_name}</h3>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Activity size={14} /> {appt.consultation_status}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginTop: 'auto' }}>
                                    <button className="btn" style={{ 
                                        width: '100%', 
                                        background: appt.consultation_status === 'Completed' ? 'var(--background)' : 'rgba(79, 70, 229, 0.08)', 
                                        color: appt.consultation_status === 'Completed' ? 'var(--text-main)' : 'var(--primary)',
                                        border: '1px solid',
                                        borderColor: appt.consultation_status === 'Completed' ? 'var(--border)' : 'var(--primary-light)',
                                        borderRadius: '12px',
                                        padding: '0.75rem',
                                        transition: 'all 0.2s'
                                    }}>
                                        {appt.consultation_status === 'Completed' ? 'Review Details' : 'Begin Consultation'} <ChevronRight size={18} style={{ marginLeft: 'auto' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="glass-panel animate-fade-in" style={{ 
                    display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '24px',
                    overflow: 'hidden'
                }}>
                    {/* Consultation Header */}
                    <div style={{ 
                        padding: '1.5rem 2.5rem', 
                        borderBottom: '1px solid var(--border)', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: 'var(--background)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.75rem', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.3)' }}>
                                {selectedAppointment.patient_details?.patient_name.charAt(0)}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: '700' }}>{selectedAppointment.patient_details?.patient_name}</h2>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: '500' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {new Date(selectedAppointment.appointment_date).toLocaleString()}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> Token #{selectedAppointment.token_number}</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ 
                            borderRadius: '50%', width: '48px', height: '48px', padding: 0, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }} onClick={() => setSelectedAppointment(null)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Sidebar inside Consultation */}
                        <div style={{ 
                            width: '280px', borderRight: '1px solid var(--border)', 
                            padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', 
                            background: 'var(--background)' 
                        }}>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '1rem' }}>Consultation Menu</div>
                            
                            {[
                                { id: 'Notes', icon: FileText, label: 'Clinical Notes' },
                                { id: 'Prescriptions', icon: Pill, label: 'Prescriptions' },
                                { id: 'LabTests', icon: Microscope, label: 'Lab Tests' },
                                { id: 'History', icon: History, label: 'Patient History' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setConsultationTab(tab.id)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', 
                                        background: consultationTab === tab.id ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                                        border: 'none', borderRadius: '12px', cursor: 'pointer',
                                        color: consultationTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                        borderLeft: consultationTab === tab.id ? '4px solid var(--primary)' : '4px solid transparent',
                                        transition: 'all 0.2s ease', fontWeight: consultationTab === tab.id ? '600' : '500',
                                        fontSize: '1.05rem'
                                    }}
                                >
                                    <tab.icon size={20} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                            {consultationTab === 'Notes' && (
                                <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
                                    <h3 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <FileText color="var(--primary)" /> Clinical Notes
                                    </h3>
                                    <form onSubmit={saveConsultation}>
                                        <div className="input-group">
                                            <label className="input-label" style={{ color: 'var(--primary)' }}>Presenting Symptoms</label>
                                            <textarea className="input-field" rows="4" name="symptoms" value={consultationForm.symptoms} onChange={(e) => setConsultationForm({...consultationForm, symptoms: e.target.value})} required style={{ background: 'var(--background)' }} placeholder="Enter patient's symptoms..."></textarea>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label" style={{ color: 'var(--primary)' }}>Diagnosis</label>
                                            <textarea className="input-field" rows="4" name="diagnosis" value={consultationForm.diagnosis} onChange={(e) => setConsultationForm({...consultationForm, diagnosis: e.target.value})} required style={{ background: 'var(--background)' }} placeholder="Enter diagnosis..."></textarea>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label" style={{ color: 'var(--primary)' }}>Additional Notes / Advice</label>
                                            <textarea className="input-field" rows="4" name="notes" value={consultationForm.notes} onChange={(e) => setConsultationForm({...consultationForm, notes: e.target.value})} style={{ background: 'var(--background)' }} placeholder="Any lifestyle advice or extra notes..."></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                                            <Save size={20} /> {consultation ? 'Update Notes' : 'Save & Mark Completed'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {consultationTab === 'Prescriptions' && (
                                <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
                                    <h3 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Pill color="var(--primary)" /> Prescribe Medicine
                                    </h3>
                                    <form onSubmit={addPrescription} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div className="input-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Medicine</label>
                                            <select className="input-field" value={prescriptionForm.medicine} onChange={e => setPrescriptionForm({...prescriptionForm, medicine: e.target.value})} required style={{ background: 'white' }}>
                                                <option value="">Select Medicine</option>
                                                {medicines.map(m => <option key={m.id} value={m.id}>{m.medicine_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Dosage</label>
                                            <input type="text" className="input-field" placeholder="e.g. 500mg" value={prescriptionForm.dosage} onChange={e => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} required style={{ background: 'white' }} />
                                        </div>
                                        <div className="input-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Frequency</label>
                                            <input type="text" className="input-field" placeholder="e.g. 1-0-1" value={prescriptionForm.frequency} onChange={e => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})} required style={{ background: 'white' }} />
                                        </div>
                                        <div className="input-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Duration</label>
                                            <input type="text" className="input-field" placeholder="e.g. 5 days" value={prescriptionForm.duration} onChange={e => setPrescriptionForm({...prescriptionForm, duration: e.target.value})} required style={{ background: 'white' }} />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ height: '45px', padding: '0 1.5rem' }}>
                                            <Plus size={20} /> Add
                                        </button>
                                    </form>

                                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>Current Prescriptions</h4>
                                    {prescriptions.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--border)' }}>No medicines prescribed yet.</p>
                                    ) : (
                                        <div style={{ background: 'var(--background)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <table className="table" style={{ margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th>Medicine</th>
                                                        <th>Dosage</th>
                                                        <th>Frequency</th>
                                                        <th>Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prescriptions.map(p => (
                                                        <tr key={p.id}>
                                                            <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.medicine_details?.medicine_name}</td>
                                                            <td>{p.dosage}</td>
                                                            <td>{p.frequency}</td>
                                                            <td>{p.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {consultationTab === 'LabTests' && (
                                <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
                                    <h3 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Microscope color="var(--primary)" /> Recommend Lab Tests
                                    </h3>
                                    <form onSubmit={addLabTest} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div className="input-group" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
                                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Lab Test</label>
                                            <select className="input-field" value={labForm.lab_test} onChange={e => setLabForm({...labForm, lab_test: e.target.value})} required style={{ background: 'white' }}>
                                                <option value="">Select Test</option>
                                                {labTests.map(t => <option key={t.id} value={t.id}>{t.test_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
                                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Remarks</label>
                                            <input type="text" className="input-field" placeholder="Any special instructions" value={labForm.remarks} onChange={e => setLabForm({...labForm, remarks: e.target.value})} style={{ background: 'white' }} />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ height: '45px', padding: '0 1.5rem' }}>
                                            <Plus size={20} /> Recommend
                                        </button>
                                    </form>

                                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>Recommended Tests</h4>
                                    {labTestPrescriptions.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--border)' }}>No tests recommended yet.</p>
                                    ) : (
                                        <div style={{ background: 'var(--background)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <table className="table" style={{ margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th>Test Name</th>
                                                        <th>Remarks</th>
                                                        <th>Result Value</th>
                                                        <th>Date Assigned</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {labTestPrescriptions.map(l => (
                                                        <tr key={l.id}>
                                                            <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{l.lab_test_details?.test_name}</td>
                                                            <td style={{ color: 'var(--text-muted)' }}>{l.remarks || '-'}</td>
                                                            <td>
                                                                {l.lab_test_value ? 
                                                                    <span className="badge badge-success">{l.lab_test_value}</span> 
                                                                    : <span className="badge badge-warning">Pending</span>
                                                                }
                                                            </td>
                                                            <td style={{ color: 'var(--text-muted)' }}>{new Date(l.created_date).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {consultationTab === 'History' && (
                                <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
                                    <h3 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <History color="var(--primary)" /> Patient Medical History
                                    </h3>
                                    <div style={{ display: 'grid', gap: '3rem' }}>
                                        
                                        <div>
                                            <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Past Consultations</h4>
                                            {patientHistory.consultations.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No past consultations found.</p> : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                    {patientHistory.consultations.map(c => (
                                                        <div key={c.id} style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                                            <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Calendar size={16} /> {new Date(c.created_date).toLocaleDateString()}
                                                            </div>
                                                            <div style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}><strong style={{ color: 'var(--text-main)' }}>Symptoms:</strong> <span style={{ color: 'var(--text-muted)' }}>{c.symptoms}</span></div>
                                                            <div style={{ lineHeight: '1.6' }}><strong style={{ color: 'var(--text-main)' }}>Diagnosis:</strong> <span style={{ color: 'var(--text-muted)' }}>{c.diagnosis}</span></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 style={{ color: 'var(--success)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Past Prescriptions</h4>
                                            {patientHistory.prescriptions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No past prescriptions found.</p> : (
                                                <div style={{ background: 'var(--background)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <table className="table" style={{ margin: 0 }}>
                                                        <thead><tr><th>Medicine</th><th>Dosage</th><th>Freq</th><th>Duration</th></tr></thead>
                                                        <tbody>
                                                            {patientHistory.prescriptions.map(p => (
                                                                <tr key={p.id}>
                                                                    <td style={{ color: 'var(--text-main)', fontWeight: '600' }}>{p.medicine_details?.medicine_name}</td>
                                                                    <td>{p.dosage}</td>
                                                                    <td>{p.frequency}</td>
                                                                    <td>{p.duration}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 style={{ color: 'var(--warning)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Lab Tests of User</h4>
                                            {patientHistory.labTests.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No past lab tests found.</p> : (
                                                <div style={{ background: 'var(--background)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <table className="table" style={{ margin: 0 }}>
                                                        <thead><tr><th>Test Name</th><th>Result Value</th><th>Reference Range</th><th>Date</th></tr></thead>
                                                        <tbody>
                                                            {patientHistory.labTests.map(l => (
                                                                <tr key={l.id}>
                                                                    <td style={{ color: 'var(--text-main)', fontWeight: '600' }}>{l.lab_test_details?.test_name}</td>
                                                                    <td>
                                                                        {l.lab_test_value ? 
                                                                            <span className="badge badge-success">{l.lab_test_value}</span> 
                                                                            : <span className="badge badge-warning">Pending</span>
                                                                        }
                                                                    </td>
                                                                    <td style={{ color: 'var(--text-muted)' }}>{l.lab_test_details?.reference_min_range} - {l.lab_test_details?.reference_max_range}</td>
                                                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(l.created_date).toLocaleDateString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
