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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/stations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStations(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch stations. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      fetchStations();
      resetForm();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred. Please try again.');
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
    setError('');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteStation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this station? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      fetchStations();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete station. Please try again.');
    }
  };

  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="admin-stations"
    >
      <div className="admin-header">
        <h2 id='stat'>Manage Stations</h2>
        {isEditing && (
          <span className="edit-badge">Editing: {currentStation?.name}</span>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

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
                className="form-control"
                placeholder="Enter station name"
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
                  className="form-control"
                  placeholder="3-5 letter code"
                  style={{ textTransform: 'uppercase' }}
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
                  className="form-control"
                  placeholder="Enter city"
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
                className="form-control"
                placeholder="Enter state/province"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isEditing ? (
                  <>
                    <i className="fas fa-save"></i> Update Station
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i> Add Station
                  </>
                )}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section">
          <div className="list-header">
            <h3>Station List</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search stations..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading stations...
            </div>
          ) : (
            <div className="station-table-container">
              <div className="station-table">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.length > 0 ? (
                      filteredStations.map(station => (
                        <tr key={station.id}>
                          <td>
                            <span className="station-code">{station.code}</span>
                          </td>
                          <td>{station.name}</td>
                          <td>
                            <div className="location-cell">
                              <span className="city">{station.city}</span>
                              <span className="state">{station.state}</span>
                            </div>
                          </td>
                          <td className="actions">
                            <button 
                              className="btn btn-sm btn-edit"
                              onClick={() => editStation(station)}
                              title="Edit station"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-delete"
                              onClick={() => deleteStation(station.id)}
                              title="Delete station"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-results">
                        <td colSpan="4">
                          {searchTerm ? (
                            'No stations match your search criteria'
                          ) : (
                            'No stations available'
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                Showing {filteredStations.length} of {stations.length} stations
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStations;