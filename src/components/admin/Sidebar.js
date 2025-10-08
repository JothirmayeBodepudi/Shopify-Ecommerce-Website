import React from 'react';
import '../styles/Sidebar.css'; // We will create this CSS file next

// Simple SVG icons for a professional look without extra libraries
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const AddProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const AddAdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line><line x1="20" y1="8" x2="20" y2="14"></line></svg>;
const ViewTableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path><line x1="12" y1="16" x2="12" y2="8"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>;


function Sidebar({ activeView, setView }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Admin Menu</h3>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${activeView === 'viewData' ? 'active' : ''}`}
          onClick={() => setView('viewData')}
        >
          <DashboardIcon />
          <span>Dashboard</span>
        </button>
        <button
          className={`sidebar-link ${activeView === 'addProduct' ? 'active' : ''}`}
          onClick={() => setView('addProduct')}
        >
          <AddProductIcon />
          <span>Add Product</span>
        </button>
        <button
          className={`sidebar-link ${activeView === 'addAdmin' ? 'active' : ''}`}
          onClick={() => setView('addAdmin')}
        >
          <AddAdminIcon />
          <span>Add Admin</span>
        </button>
         <button
          className={`sidebar-link ${activeView === 'allTables' ? 'active' : ''}`}
          onClick={() => setView('allTables')}
        >
          <ViewTableIcon />
          <span>View Tables</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
