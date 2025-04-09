import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './AdminTrains.css';

const AdminTrains = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTrain, setCurrentTrain] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    source_station_id: '',
    destination_station_id: '',
    total_seats: '',
    departure_time: '',
    arrival_time: '',
    fare_per_km: ''
  });
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/trains', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTrains(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch trains. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stations');
      const data = await response.json();
      setStations(data);
    } catch (err) {
      console.error('Failed to fetch stations:', err);
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
      const method = currentTrain ? 'PUT' : 'POST';
      const url = currentTrain 
        ? `http://localhost:5000/api/admin/trains/${currentTrain.id}`
        : 'http://localhost:5000/api/admin/trains';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchTrains();
        resetForm();
        setSuccess(`Train ${currentTrain ? 'updated' : 'added'} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
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
      number: '',
      source_station_id: '',
      destination_station_id: '',
      total_seats: '',
      departure_time: '',
      arrival_time: '',
      fare_per_km: ''
    });
    setCurrentTrain(null);
    setIsEditing(false);
    setError('');
  };

  const editTrain = (train) => {
    setCurrentTrain(train);
    setFormData({
      name: train.name,
      number: train.number,
      source_station_id: train.source_station_id,
      destination_station_id: train.destination_station_id,
      total_seats: train.total_seats,
      departure_time: train.departure_time,
      arrival_time: train.arrival_time,
      fare_per_km: train.fare_per_km
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTrain = async (id) => {
    if (!window.confirm('Are you sure you want to delete this train? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/trains/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchTrains();
        setSuccess('Train deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error occurred');
    }
  };

  const filteredTrains = trains.filter(train => 
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.source_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.destination_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="admin-trains dark-theme"
    >
      <div className="admin-header">
        <h2>Manage Trains</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search trains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
      </div>
      
      {error && (
        <motion.div 
          className="alert alert-error"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
          <button onClick={() => setError('')} className="close-btn">
            &times;
          </button>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          className="alert alert-success"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">
            &times;
          </button>
        </motion.div>
      )}

      <div className="admin-content">
        <div className="form-section card">
          <h3>{isEditing ? 'Edit Train' : 'Add New Train'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Train Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="dark-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Train Number</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  className="dark-input"
                />
              </div>
              
              <div className="form-group">
                <label>Total Seats</label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="dark-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Source Station</label>
                <select
                  name="source_station_id"
                  value={formData.source_station_id}
                  onChange={handleInputChange}
                  required
                  className="dark-input"
                >
                  <option value="">Select Source</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Destination Station</label>
                <select
                  name="destination_station_id"
                  value={formData.destination_station_id}
                  onChange={handleInputChange}
                  required
                  className="dark-input"
                >
                  <option value="">Select Destination</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  required
                  className="dark-input"
                />
              </div>
              
              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="time"
                  name="arrival_time"
                  value={formData.arrival_time}
                  onChange={handleInputChange}
                  required
                  className="dark-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fare per KM (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="fare_per_km"
                value={formData.fare_per_km}
                onChange={handleInputChange}
                required
                className="dark-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Train' : 'Add Train'}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section card">
          <h3>Train List</h3>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading trains...</p>
            </div>
          ) : (
            <>
              <div className="table-info">
                <span>Showing {filteredTrains.length} of {trains.length} trains</span>
              </div>
              <div className="train-table-container">
                <table className="train-table">
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Name</th>
                      <th>Route</th>
                      <th>Timing</th>
                      <th>Seats</th>
                      <th>Fare/KM</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrains.length > 0 ? (
                      filteredTrains.map(train => (
                        <tr key={train.id}>
                          <td className="font-mono">{train.number}</td>
                          <td className="font-bold">{train.name}</td>
                          <td>
                            <div className="route-info">
                              <span className="source">{train.source_code}</span>
                              <span className="arrow">→</span>
                              <span className="destination">{train.destination_code}</span>
                            </div>
                          </td>
                          <td>
                            <div className="timing-info">
                              <span>{train.departure_time}</span>
                              <span>to</span>
                              <span>{train.arrival_time}</span>
                            </div>
                          </td>
                          <td>
                            <div className="seats-info">
                              <span className={train.available_seats < train.total_seats * 0.2 ? 'text-warning' : ''}>
                                {train.available_seats}
                              </span>
                              <span>/</span>
                              <span>{train.total_seats}</span>
                            </div>
                          </td>
                          <td className="font-mono">₹{train.fare_per_km}</td>
                          <td className="actions">
                            <button 
                              className="btn-action btn-edit"
                              onClick={() => editTrain(train)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => deleteTrain(train.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-results">
                          <i className="fas fa-train"></i>
                          <p>No trains found matching your search</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminTrains;