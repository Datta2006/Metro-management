import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminTrains from './AdminTrains';
import AdminStations from './AdminStations';
import AdminUsers from './AdminUsers';
import './AdminPanel.css';

const AdminPanel = ({ setAuthentication, user }) => {
  const [activeTab, setActiveTab] = useState('trains');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthentication(false);
    navigate('/login');
  };

  return (
    <motion.div
      className="admin-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="header">
        <div className="logo">
          <span>👑</span>
          <h1>Admin Panel</h1>
        </div>
        <nav className="nav-links">
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </nav>
      </header>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'trains' ? 'active' : ''}`}
          onClick={() => setActiveTab('trains')}
        >
          Trains
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stations' ? 'active' : ''}`}
          onClick={() => setActiveTab('stations')}
        >
          Stations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <main className="admin-content">
        {activeTab === 'trains' && <AdminTrains />}
        {activeTab === 'stations' && <AdminStations />}
        {activeTab === 'users' && <AdminUsers />}
      </main>
    </motion.div>
  );
};

export default AdminPanel;