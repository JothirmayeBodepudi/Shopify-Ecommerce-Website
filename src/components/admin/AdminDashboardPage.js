import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ShoppingBag, PlusCircle, Users, 
  UserPlus, MessageSquare, FileQuestion, ShoppingCart, 
  LogOut, DollarSign, Clock, TrendingUp, Bell
} from 'lucide-react';

import AddAdminForm from '../admin/AddAdminForm';
import AddProductForm from '../admin/AddProductForm';
import DataTableViewer from '../admin/DataTableViewer';
import ActivityChart from '../admin/ActivityChart';
import '../styles/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

function AdminDashboardPage({ user = { name: 'Admin' }, token, onLogout }) {
  const [activeView, setActiveView] = useState('dashboardOverview');
  const [tableData, setTableData] = useState(null);
  const [dashboardData, setDashboardData] = useState({ stats: {}, chartData: [] });
  const [currentTable, setCurrentTable] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Dashboard Stats
  useEffect(() => {
    if (activeView === 'dashboardOverview') {
      const fetchDashboardStats = async () => {
        try {
          setIsLoading(true);
          const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setDashboardData(res.data);
          }
        } catch (err) {
          console.error("Dashboard fetch error", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDashboardStats();
    }
  }, [activeView, token]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'dashboardOverview': return 'Dashboard Overview';
      case 'addAdmin': return 'Add New Admin';
      case 'addProduct': return 'Add New Product';
      case 'viewTables': return `Manage: ${currentTable}`;
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
        'Orders': '/api/admin/orders'
      };
      fetchData(currentTable, endpointMap[currentTable]);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboardOverview':
        return (
          <div className="dashboard-content">
            {/* Stat Cards Row */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper revenue-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Total Revenue</p>
                  <h3 className="stat-value">
                    ${dashboardData.stats.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper pending-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Pending Orders</p>
                  <h3 className="stat-value">{dashboardData.stats.pendingOrders || 0}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper new-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">New Orders (Today)</p>
                  <h3 className="stat-value">{dashboardData.stats.newOrdersToday || 0}</h3>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="chart-container card-shadow">
              <ActivityChart data={dashboardData.chartData} isLoading={isLoading} /> 
            </div>
          </div>
        );

      case 'addAdmin':
        return <div className="admin-view-card card-shadow"><AddAdminForm token={token} onLogout={onLogout} /></div>;

      case 'addProduct':
        return <div className="admin-view-card card-shadow"><AddProductForm token={token} onLogout={onLogout} /></div>;

      case 'viewTables':
        return (
          <div className="admin-view-card card-shadow data-table-wrapper">
            {isLoading && <div className="loading-spinner">Loading data...</div>}
            {error && <p className="error-message">{error}</p>}
            {tableData && !isLoading && (
              <DataTableViewer 
                data={tableData} 
                tableName={currentTable} 
                token={token} 
                refreshData={refreshCurrentTable}
                onLogout={onLogout} 
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">Admin</div>
          <h2>Portal</h2>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-group">
            <p className="menu-label">Main</p>
            <button className={`menu-item ${activeView === 'dashboardOverview' ? 'active' : ''}`} onClick={() => setActiveView('dashboardOverview')}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Orders' ? 'active' : ''}`} onClick={() => fetchData('Orders', '/api/admin/orders')}>
              <ShoppingCart size={18} /> Orders
            </button>
          </div>

          <div className="menu-group">
            <p className="menu-label">Catalog Management</p>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Products' ? 'active' : ''}`} onClick={() => fetchData('Products', '/api/admin/products')}>
              <ShoppingBag size={18} /> Products List
            </button>
            <button className={`menu-item ${activeView === 'addProduct' ? 'active' : ''}`} onClick={() => setActiveView('addProduct')}>
              <PlusCircle size={18} /> Add Product
            </button>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Dealers' ? 'active' : ''}`} onClick={() => fetchData('Dealers', '/api/admin/dealers')}>
              <Users size={18} /> Dealers / Vendors
            </button>
          </div>

          <div className="menu-group">
            <p className="menu-label">Communications</p>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Contact Messages' ? 'active' : ''}`} onClick={() => fetchData('Contact Messages', '/api/admin/contacts')}>
              <MessageSquare size={18} /> Contact Messages
            </button>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Media Queries' ? 'active' : ''}`} onClick={() => fetchData('Media Queries', '/api/admin/media-queries')}>
              <FileQuestion size={18} /> Media Queries
            </button>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Product Surveys' ? 'active' : ''}`} onClick={() => fetchData('Product Surveys', '/api/admin/product-surveys')}>
              <TrendingUp size={18} /> Product Surveys
            </button>
          </div>

          <div className="menu-group">
            <p className="menu-label">System</p>
            <button className={`menu-item ${activeView === 'viewTables' && currentTable === 'Admins' ? 'active' : ''}`} onClick={() => fetchData('Admins', '/api/admin/admins')}>
              <Users size={18} /> Admin Users
            </button>
            <button className={`menu-item ${activeView === 'addAdmin' ? 'active' : ''}`} onClick={() => setActiveView('addAdmin')}>
              <UserPlus size={18} /> Add Admin
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <h1 className="page-title">{getHeaderTitle()}</h1>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-profile">
              <div className="avatar">{getInitials(user.name)}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="admin-content-scroll">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;