import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Network error occurred');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error occurred');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="admin-users__container"
    >
      <div className="admin-users__header">
        <h2 className="admin-users__title">User Management</h2>
        <div className="admin-users__search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-users__search-input"
          />
          <i className="admin-users__search-icon fas fa-search"></i>
        </div>
      </div>
      
      {error && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="admin-users__error"
        >
          {error}
        </motion.div>
      )}

      <div className="admin-users__content">
        {isLoading ? (
          <div className="admin-users__loading">
            <div className="admin-users__spinner"></div>
            <p className="admin-users__loading-text">Loading users...</p>
          </div>
        ) : (
          <div className="admin-users__table-wrapper">
            <table className="admin-users__table">
              <thead className="admin-users__table-head">
                <tr className="admin-users__table-row">
                  <th className="admin-users__table-header">Username</th>
                  <th className="admin-users__table-header">Email</th>
                  <th className="admin-users__table-header">Role</th>
                  <th className="admin-users__table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="admin-users__table-body">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="admin-users__table-row"
                    >
                      <td className="admin-users__table-data">{user.username}</td>
                      <td className="admin-users__table-data">{user.email}</td>
                      <td className="admin-users__table-data">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="admin-users__role-select"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      </td>
                      <td className="admin-users__table-data admin-users__actions">
                        <button 
                          className="admin-users__btn admin-users__btn--delete"
                          onClick={() => deleteUser(user.id)}
                          disabled={user.role === 'admin'}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="admin-users__table-row admin-users__no-results">
                    <td colSpan="4" className="admin-users__table-data">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="admin-users__footer">
              <span className="admin-users__count">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsers;