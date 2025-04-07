import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './AdminStations.css';

const AdminStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStations(data);
    } catch (err) {
      setError('Failed to fetch stations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentStation ? 'PUT' : 'POST';
      const url = currentStation 
        ? `http://localhost:5000/api/admin/stations/${currentStation.id}`
        : 'http://localhost:5000/api/admin/stations';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchStations();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      city: '',
      state: ''
    });
    setCurrentStation(null);
    setIsEditing(false);
  };

  const editStation = (station) => {
    setCurrentStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      city: station.city,
      state: station.state
    });
    setIsEditing(true);
  };

  const deleteStation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this station?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchStations();
      } else {
        const data = await response.json();
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="admin-stations"
    >
      <h2>Manage Stations</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        <div className="form-section">
          <h3>{isEditing ? 'Edit Station' : 'Add New Station'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Station Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Station Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  maxLength="5"
                />
              </div>
              
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Station' : 'Add Station'}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-danger" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section">
          <h3>Station List</h3>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="station-table">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map(station => (
                    <tr key={station.id}>
                      <td>{station.code}</td>
                      <td>{station.name}</td>
                      <td>{station.city}</td>
                      <td>{station.state}</td>
                      <td className="actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => editStation(station)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteStation(station.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStations;