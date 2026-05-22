import React, { useState, useEffect } from 'react';
import api from '../api';
import { Pill, Plus, X, ListPlus, PackagePlus, Trash2 } from 'lucide-react';

const PharmacyInventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [addStockAmount, setAddStockAmount] = useState('');
    
    const [formData, setFormData] = useState({
        medicine_name: '',
        manufacturing_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date().toISOString().split('T')[0],
        unit: 'Tablets',
        unit_price: '0.00',
        category: '',
        initial_stock: '10'
    });

    const fetchData = async () => {
        try {
            const [medsRes, catsRes, stockRes] = await Promise.all([
                api.get('medicines/'),
                api.get('medicine-categories/'),
                api.get('inventory/medicine/')
            ]);
            setMedicines(medsRes.data);
            setCategories(catsRes.data);
            setStocks(stockRes.data);
            
            if (catsRes.data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: catsRes.data[0].id }));
            }
        } catch (err) {
            console.error("Failed to fetch inventory data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('medicine-categories/', { category_name: newCategoryName });
            setCategories([...categories, res.data]);
            setFormData(prev => ({ ...prev, category: res.data.id }));
            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch (err) {
            console.error("Failed to add category", err);
            alert("Error adding category");
        }
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        try {
            const amount = parseInt(addStockAmount, 10);
            if (selectedStock.stock_id) {
                await api.patch(`inventory/medicine/${selectedStock.stock_id}/`, {
                    stock_in_hand: selectedStock.current + amount,
                    purchase: selectedStock.purchase + amount
                });
            } else {
                await api.post('inventory/medicine/', {
                    medicine: selectedStock.medicine_id,
                    stock_in_hand: amount,
                    re_order_level: 5,
                    purchase: amount,
                    issuance: 0
                });
            }
            setShowStockModal(false);
            setAddStockAmount('');
            setSelectedStock(null);
            fetchData();
        } catch (err) {
            console.error("Failed to update stock", err);
            alert("Error updating stock");
        }
    };

    const handleDeleteMedicine = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medicine? This will also remove its stock data.')) return;
        try {
            await api.delete(`medicines/${id}/`);
            fetchData();
        } catch (err) {
            console.error("Failed to delete medicine", err);
            alert("Error deleting medicine");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent duplicates
        const exists = medicines.some(
            m => m.medicine_name.toLowerCase().trim() === formData.medicine_name.toLowerCase().trim()
        );
        
        if (exists) {
            alert(`A medicine with the name "${formData.medicine_name}" already exists in the inventory.`);
            return;
        }

        try {
            const medPayload = {
                medicine_name: formData.medicine_name,
                manufacturing_date: formData.manufacturing_date,
                expiry_date: formData.expiry_date,
                unit: formData.unit,
                unit_price: formData.unit_price,
                category: formData.category
            };
            const medRes = await api.post('medicines/', medPayload);
            
            const stockPayload = {
                medicine: medRes.data.id,
                stock_in_hand: parseInt(formData.initial_stock, 10),
                re_order_level: 5,
                purchase: parseInt(formData.initial_stock, 10),
                issuance: 0
            };
            await api.post('inventory/medicine/', stockPayload);

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to add medicine", err);
            alert("Error adding medicine");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Pill color="var(--primary)" /> Medicine Inventory</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your clinic's pharmacy stock and pricing.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}>
                        <ListPlus size={18} /> Add Category
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add New Medicine
                    </button>
                </div>
            </div>

            <div className="glass-panel animate-fade-in">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No medicines found in inventory.</td></tr>
                            ) : medicines.map(med => {
                                const catName = categories.find(c => c.id === med.category)?.category_name || 'Unknown';
                                const stock = stocks.find(s => s.medicine === med.id);
                                const currentStock = stock ? stock.stock_in_hand : 0;
                                const isLowStock = currentStock <= (stock?.re_order_level || 5);

                                return (
                                    <tr key={med.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{med.medicine_name}</td>
                                        <td>{catName}</td>
                                        <td>${med.unit_price}</td>
                                        <td style={{ fontWeight: 600, color: isLowStock ? 'var(--danger)' : 'var(--text-main)' }}>
                                            {currentStock} {med.unit}
                                        </td>
                                        <td>{med.expiry_date}</td>
                                        <td>
                                            {currentStock > 0 ? (
                                                <span className="badge badge-success">In Stock</span>
                                            ) : (
                                                <span className="badge badge-danger">Out of Stock</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => {
                                                    setSelectedStock({
                                                        medicine_name: med.medicine_name,
                                                        medicine_id: med.id,
                                                        stock_id: stock?.id,
                                                        current: currentStock,
                                                        purchase: stock?.purchase || 0
                                                    });
                                                    setShowStockModal(true);
                                                }}>
                                                    <PackagePlus size={16} /> Add Stock
                                                </button>
                                                <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.4rem 0.6rem', border: 'none' }} onClick={() => handleDeleteMedicine(med.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Stock Modal */}
            {showStockModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Add Stock</h2>
                            <button onClick={() => setShowStockModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            Adding stock for <strong style={{ color: 'var(--text-main)' }}>{selectedStock?.medicine_name}</strong> (Current: {selectedStock?.current})
                        </p>
                        <form onSubmit={handleStockSubmit}>
                            <div className="input-group">
                                <label className="input-label">Amount to Add</label>
                                <input type="number" min="1" className="input-field" placeholder="e.g. 50" value={addStockAmount} onChange={(e) => setAddStockAmount(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                                Update Stock
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Add Category</h2>
                            <button onClick={() => setShowCategoryModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="input-group">
                                <label className="input-label">Category Name</label>
                                <input type="text" className="input-field" placeholder="e.g. Antibiotics, Painkillers" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                                Save Category
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Medicine Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Add New Medicine</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Medicine Name</label>
                                <input type="text" name="medicine_name" className="input-field" value={formData.medicine_name} onChange={handleInputChange} required />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 2 }}>
                                    <label className="input-label">Category</label>
                                    <select name="category" className="input-field" value={formData.category} onChange={handleInputChange} required>
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.category_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Unit Price ($)</label>
                                    <input type="number" step="0.01" name="unit_price" className="input-field" value={formData.unit_price} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Manufacturing Date</label>
                                    <input type="date" name="manufacturing_date" className="input-field" value={formData.manufacturing_date} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Expiry Date</label>
                                    <input type="date" name="expiry_date" className="input-field" value={formData.expiry_date} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Unit (e.g. Tablets)</label>
                                    <input type="text" name="unit" className="input-field" value={formData.unit} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Initial Stock</label>
                                    <input type="number" name="initial_stock" className="input-field" value={formData.initial_stock} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                                Save & Update Inventory
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyInventory;
