import React, { useState, useMemo } from 'react';
import axios from 'axios';
// It's good practice to have a separate CSS file for a complex component
 import '../styles/DataTableViewer.css'; 

const API_URL = 'http://localhost:5001';

export default function DataTableViewer({ data, tableName, token, refreshData, onLogout }) {
    // --- STATE MANAGEMENT ---
    // State from both versions combined
    const [selectedIds, setSelectedIds] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [deletingRowId, setDeletingRowId] = useState(null);
    const [error, setError] = useState('');

    // --- CONFIGURATION HELPERS ---
    const { endpoint, primaryKey } = useMemo(() => {
        switch (tableName) {
            case 'Admins': return { endpoint: 'admins', primaryKey: 'username' };
            case 'Contact Messages': return { endpoint: 'contacts', primaryKey: 'id' };
            case 'Dealers': return { endpoint: 'dealers', primaryKey: 'dealerId' };
            case 'Media Queries': return { endpoint: 'media-queries', primaryKey: 'id' };
            case 'Product Surveys': return { endpoint: 'product-surveys', primaryKey: 'id' };
            case 'Products': return { endpoint: 'products', primaryKey: 'productId' };
            default: return { endpoint: '', primaryKey: 'id' };
        }
    }, [tableName]);

    const headers = useMemo(() => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]).filter(key => key !== 'password');
    }, [data]);
    
    // --- HANDLER FUNCTIONS ---

    // -- Selection Handlers --
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(data.map(item => item[primaryKey]));
        } else {
            setSelectedIds([]);
        }
    };
    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // -- Single Item Action Handlers --
    const handleEdit = (row) => setEditingRow({ ...row });
    
    const handleDelete = async (id) => {
        if (!endpoint) return;
        try {
            await axios.delete(`/api/admin/${endpoint}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDeletingRowId(null);
            refreshData();
        } catch (err) {
            setError('Failed to delete item.');
        }
    };

    // -- Modal Action Handlers --
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!endpoint || !editingRow) return;
        const id = editingRow[primaryKey];
        try {
            await axios.put(`/api/admin/${endpoint}/${id}`, editingRow, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingRow(null);
            refreshData();
        } catch (err) {
            setError('Failed to update item.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingRow(prev => ({ ...prev, [name]: value }));
    };

    // -- Batch Action Handler --
    const handleBatchDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) return;
        try {
            await axios.post(`/api/admin/batch-delete`, 
                { tableName, ids: selectedIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedIds([]);
            refreshData();
        } catch (err) {
            if (err.response?.status === 403) {
                alert("Your session has expired. Please log in again.");
                onLogout();
            } else {
                alert("Failed to delete items.");
            }
        }
    };

    // --- RENDER LOGIC ---
    if (!data || data.length === 0) {
        return <p>No data available for this table.</p>;
    }

    return (
        <div className="data-table-container">
            {error && <p className="error-message">{error}</p>}

            {selectedIds.length > 0 && (
                <div className="batch-actions-container">
                    <button onClick={handleBatchDelete} className="btn btn-danger">
                        Delete Selected ({selectedIds.length})
                    </button>
                </div>
            )}

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={data.length > 0 && selectedIds.length === data.length}
                                />
                            </th>
                            {headers.map(header => <th key={header}>{header}</th>)}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row[primaryKey]}>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={selectedIds.includes(row[primaryKey])}
                                        onChange={() => handleSelectOne(row[primaryKey])}
                                    />
                                </td>
                                {headers.map(header => <td key={header} data-label={header}>{String(row[header])}</td>)}
                                <td className="actions-cell">
                                    <button className="btn btn-edit" onClick={() => handleEdit(row)}>Edit</button>
                                    <button className="btn btn-delete" onClick={() => setDeletingRowId(row[primaryKey])}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Modals --- */}
            // Inside the return statement of your DataTableViewer component

{editingRow && (
    <div className="modal-overlay">
        <div className="modal-content">
            {/* 1. Create a dedicated header */}
            <div className="modal-header">
                <h2>Edit {tableName.slice(0, -1)}</h2>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
                {/* 2. Wrap form fields in a scrollable modal-body */}
                <div className="modal-body">
                    {Object.keys(editingRow).map(key => (
                        <div className="form-group" key={key}>
                            <label htmlFor={key}>{key}</label>
                            <input
                                type="text"
                                id={key} name={key}
                                value={editingRow[key]}
                                onChange={handleInputChange}
                                disabled={key === primaryKey}
                            />
                        </div>
                    ))}
                </div>
                {/* 3. Use modal-footer for actions */}
                <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn" onClick={() => setEditingRow(null)}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
)}
            {deletingRowId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-delete" onClick={() => handleDelete(deletingRowId)}>Confirm Delete</button>
                            <button type="button" className="btn" onClick={() => setDeletingRowId(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}