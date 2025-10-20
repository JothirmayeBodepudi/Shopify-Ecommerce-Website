import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddAdminForm from '../admin/AddAdminForm';
import AddProductForm from '../admin/AddProductForm';
import DataTableViewer from '../admin/DataTableViewer';
import '../styles/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

function AdminDashboardPage({ user = { name: 'Admin' }, token, onLogout }) {
  const [activeView, setActiveView] = useState('viewTables');
  const [tableData, setTableData] = useState(null);
  const [currentTable, setCurrentTable] = useState('Products');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData('Products', '/api/admin/products');
  }, []);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'addAdmin': return 'Add New Admin';
      case 'addProduct': return 'Add New Product';
      case 'viewTables': return `Viewing: ${currentTable}`;
      default: return 'Dashboard';
    }
  };

  const fetchData = async (tableName, endpoint) => {
    setActiveView('viewTables');
    setCurrentTable(tableName);
    setIsLoading(true);
    setError('');
    setTableData(null);

    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTableData(response.data.data);
      } else {
        setError(`Failed to fetch ${tableName}.`);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert("Your session has expired. Please log in again.");
        onLogout();
      } else {
        setError(`Failed to fetch ${tableName}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshCurrentTable = () => {
    if (currentTable) {
      const endpointMap = {
        'Products': '/api/admin/products',
        'Admins': '/api/admin/admins',
        'Contact Messages': '/api/admin/contacts',
        'Dealers': '/api/admin/dealers',
        'Media Queries': '/api/admin/media-queries',
        'Product Surveys': '/api/admin/product-surveys',
      };
      fetchData(currentTable, endpointMap[currentTable]);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'addAdmin':
        return <div className="admin-card"><AddAdminForm token={token} onLogout={onLogout} /></div>;
      case 'addProduct':
        return <div className="admin-card"><AddProductForm token={token} onLogout={onLogout} /></div>;
      case 'viewTables':
      default:
        return (
          <div className="admin-card">
            <div className="data-display-area">
              {isLoading && <p>Loading...</p>}
              {error && <p className="error-message">{error}</p>}
              {tableData && (
                <DataTableViewer 
                  data={tableData} 
                  tableName={currentTable} 
                  token={token} 
                  refreshData={refreshCurrentTable}
                  onLogout={onLogout} 
                />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><h2>Admin Panel</h2></div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-button ${activeView === 'addProduct' ? 'active' : ''}`} 
            onClick={() => setActiveView('addProduct')}
          >
            Add Product
          </button>
          <button 
            className={`nav-button ${activeView === 'viewTables' && currentTable === 'Products' ? 'active' : ''}`} 
            onClick={() => fetchData('Products', '/api/admin/products')}
          >
            View Products
          </button>
          <hr />
          <button 
            className={`nav-button ${activeView === 'addAdmin' ? 'active' : ''}`} 
            onClick={() => setActiveView('addAdmin')}
          >
            Add Admin
          </button>
          <button 
            className={`nav-button ${activeView === 'viewTables' && currentTable === 'Admins' ? 'active' : ''}`} 
            onClick={() => fetchData('Admins', '/api/admin/admins')}
          >
            View Admins
          </button>
          <button 
            className={`nav-button ${activeView === 'viewTables' && currentTable === 'Contact Messages' ? 'active' : ''}`} 
            onClick={() => fetchData('Contact Messages', '/api/admin/contacts')}
          >
            View Contacts
          </button>
          <button 
            className={`nav-button ${activeView === 'viewTables' && currentTable === 'Dealers' ? 'active' : ''}`} 
            onClick={() => fetchData('Dealers', '/api/admin/dealers')}
          >
            View Dealers
          </button>
          {/* --- (NEW) Added remaining tables --- */}
          <button 
            className={`nav-button ${activeView === 'viewTables' && currentTable === 'Media Queries' ? 'active' : ''}`} 
            onClick={() => fetchData('Media Queries', '/api/admin/media-queries')}
          >
            View Media Queries
          </button>
          <button 
            className={`nav-button ${activeView === 'viewTables' && currentTable === 'Product Surveys' ? 'active' : ''}`} 
            onClick={() => fetchData('Product Surveys', '/api/admin/product-surveys')}
          >
            View Surveys
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn btn-danger logout-button">Logout</button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="main-content-header">
          <h1>{getHeaderTitle()}</h1>
          <div className="user-profile">
            <div className="profile-avatar">{getInitials(user.name)}</div>
            <span className="user-name">Welcome, {user.name}</span>
          </div>
        </header>
        {renderActiveView()}
      </main>
    </div>
  );
}

export default AdminDashboardPage;