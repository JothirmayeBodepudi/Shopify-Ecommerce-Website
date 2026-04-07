import React, { useState, useMemo } from 'react';
import axios from 'axios';
import '../styles/DataTableViewer.css';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

export default function DataTableViewer({
  data,
  tableName,
  token,
  refreshData,
  onLogout,
}) {
  /* ---------------- STATE ---------------- */
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [deletingRowId, setDeletingRowId] = useState(null);
  const [error, setError] = useState('');

  /* ---------------- CONFIG ---------------- */
  const { endpoint, primaryKey } = useMemo(() => {
    switch (tableName) {
      case 'Admins':
        return { endpoint: 'admins', primaryKey: 'username' };
      case 'Contact Messages':
        return { endpoint: 'contacts', primaryKey: 'id' };
      case 'Dealers':
        return { endpoint: 'dealers', primaryKey: 'dealerId' };
      case 'Media Queries':
        return { endpoint: 'media-queries', primaryKey: 'id' };
      case 'Product Surveys':
        return { endpoint: 'product-surveys', primaryKey: 'id' };
      case 'Products':
        return { endpoint: 'products', primaryKey: 'productId' };
      case 'Orders':
        return { endpoint: 'orders', primaryKey: 'orderId' };
      default:
        return { endpoint: '', primaryKey: 'id' };
    }
  }, [tableName]);

  const headers = useMemo(() => {
    if (!data || data.length === 0) return [];

    const hiddenFields =
      tableName === 'Orders'
        ? ['items', 'status']
        : ['password'];

    return Object.keys(data[0]).filter(
      (key) => !hiddenFields.includes(key)
    );
  }, [data, tableName]);

  /* ---------------- SELECTION ---------------- */
  const handleSelectAll = (e) => {
    setSelectedIds(
      e.target.checked ? data.map((d) => d[primaryKey]) : []
    );
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  /* ---------------- ORDER STATUS UPDATE ---------------- */
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/admin/${endpoint}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshData();
      setDeletingRowId(null);
    } catch {
      setError('Delete failed');
    }
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdate = async (e) => {
    e.preventDefault();
    const id = editingRow[primaryKey];

    try {
      await axios.put(
        `${API_URL}/api/admin/${endpoint}/${id}`,
        editingRow,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingRow(null);
      refreshData();
    } catch {
      setError('Update failed');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRow((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- BATCH DELETE ---------------- */
  const handleBatchDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items?`))
      return;

    try {
      await axios.post(
        `${API_URL}/api/admin/batch-delete`,
        { tableName, ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedIds([]);
      refreshData();
    } catch {
      alert('Batch delete failed');
    }
  };

  /* ---------------- RENDER ---------------- */
  if (!data || data.length === 0)
    return <p>No data available.</p>;

  return (
    <div className="data-table-container">
      {error && <p className="error-message">{error}</p>}

      {/* ✅ ALLOW BATCH DELETE FOR ORDERS */}
      {selectedIds.length > 0 && (
        <button
          className="btn btn-danger"
          onClick={handleBatchDelete}
        >
          Delete Selected ({selectedIds.length})
        </button>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedIds.length === data.length &&
                  data.length > 0
                }
              />
            </th>

            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}

            {tableName === 'Orders' && <th>Status</th>}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row[primaryKey]}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(
                    row[primaryKey]
                  )}
                  onChange={() =>
                    handleSelectOne(row[primaryKey])
                  }
                />
              </td>

              {headers.map(header => (
                <td key={header}>
                  {typeof row[header] === 'object' && row[header] !== null
                    ? JSON.stringify(row[header])
                    : String(row[header] || '')}
                </td>
              ))}

              {/* -------- ORDER STATUS -------- */}
              {tableName === 'Orders' && (
                <td>
                  <select
                    value={row.status}
                    onChange={(e) =>
                      updateOrderStatus(
                        row.orderId,
                        e.target.value
                      )
                    }
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              )}

              {/* -------- ACTIONS (NOW SHOWS ON ORDERS TOO) -------- */}
              <td className="actions-cell">
                <button
                  className="btn btn-edit"
                  onClick={() => setEditingRow(row)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() =>
                    setDeletingRowId(row[primaryKey])
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* -------- EDIT MODAL -------- */}
      {editingRow && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit {tableName.slice(0, -1)}</h2>
            <form onSubmit={handleUpdate}>
              {Object.keys(editingRow).map((key) => {
                // Determine if this field is a complex object (like items or shipping)
                const isObject = typeof editingRow[key] === 'object' && editingRow[key] !== null;

                return (
                  <div className="form-group" key={key}>
                    <label>{key}</label>
                    <input
                      type="text"
                      name={key}
                      // Safely display objects as JSON strings
                      value={isObject ? JSON.stringify(editingRow[key]) : editingRow[key] || ''}
                      onChange={handleInputChange}
                      // Disable primary keys AND complex objects so admins don't accidentally break arrays/JSON
                      disabled={key === primaryKey || isObject}
                    />
                  </div>
                );
              })}
              <div className="modal-actions">
                <button className="btn btn-edit" type="submit">
                  Save
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditingRow(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- DELETE CONFIRM -------- */}
      {deletingRowId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Confirm delete?</p>
            <div className="modal-actions">
              <button
                className="btn btn-delete"
                onClick={() => handleDelete(deletingRowId)}
              >
                Yes
              </button>
              <button
                className="btn"
                onClick={() => setDeletingRowId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}