import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './AdminTrains.css';

const AdminTrains = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);

  const fetchTrains = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/trains', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTrains(data);
    } catch (err) {
      setError('Failed to fetch trains');
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
  };

  const deleteTrain = async (id) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/trains/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchTrains();
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
      className="admin-trains"
    >
      <h2>Manage Trains</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        <div className="form-section">
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
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fare per KM (₹)</label>
              <input
                type="number"
                step="0.01"
                name="fare_per_km"
                value={formData.fare_per_km}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Train' : 'Add Train'}
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
          <h3>Train List</h3>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="train-table">
              <table>
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.map(train => (
                    <tr key={train.id}>
                      <td>{train.number}</td>
                      <td>{train.name}</td>
                      <td>{train.source_code} to {train.destination_code}</td>
                      <td>{train.available_seats}/{train.total_seats}</td>
                      <td className="actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => editTrain(train)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteTrain(train.id)}
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

export default AdminTrains;