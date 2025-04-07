import React, { useState, useEffect } from 'react';
import './SearchForm.css';

const SearchForm = ({ searchParams, setSearchParams, handleSearch }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/stations');
        const data = await response.json();
        setStations(data);
      } catch (err) {
        console.error('Failed to fetch stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return (
    <form className="search-form" onSubmit={handleSearch}>
      <div className="form-group">
        <label>From</label>
        <select
          value={searchParams.source}
          onChange={(e) => setSearchParams({...searchParams, source: e.target.value})}
        >
          <option value="">Select Station</option>
          {stations.map(station => (
            <option key={station.id} value={station.code}>
              {station.name} ({station.code})
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>To</label>
        <select
          value={searchParams.destination}
          onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
        >
          <option value="">Select Station</option>
          {stations.map(station => (
            <option key={station.id} value={station.code}>
              {station.name} ({station.code})
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={searchParams.date}
          onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="form-group">
        <label>Class</label>
        <select
          value={searchParams.classType}
          onChange={(e) => setSearchParams({...searchParams, classType: e.target.value})}
        >
          <option value="SL">Sleeper (SL)</option>
          <option value="3A">AC 3 Tier (3A)</option>
          <option value="2A">AC 2 Tier (2A)</option>
          <option value="1A">AC First Class (1A)</option>
        </select>
      </div>
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Searching...' : 'Search Trains'}
      </button>
    </form>
  );
};

export default SearchForm;