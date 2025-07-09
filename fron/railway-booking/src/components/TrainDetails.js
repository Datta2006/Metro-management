import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrain, FaUser, FaClock, FaRupeeSign, FaPlus, FaMinus } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { GiPathDistance } from 'react-icons/gi';
import { FaEthereum } from 'react-icons/fa';
import Web3 from 'web3';


import './TrainDetails.css';

const TrainDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male' }]);
  const [classType, setClassType] = useState('SL');
  const [selectedStop, setSelectedStop] = useState(null);
  const web3 = new Web3();

  useEffect(() => {
    const fetchTrainDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/trains/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setTrain(data);
        } else {
          setError(data.error || 'Failed to fetch train details');
        }
      } catch (err) {
        console.error('Fetch train error:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainDetails();
  }, [id]);
const handleMetamaskPayment = async () => {
  if (!window.ethereum) {
    setError('Install MetaMask to pay with crypto');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // Tiny test amount (0.0000000001 ETH)
    const amountInWei = '0x5AF3107A4000'; 

    // Generate rich description with booking details
    const description = `Metro Ticket Booking\n
      Train: ${train.number} - ${train.name}\n
      Route: ${train.source_name} → ${train.destination_name}\n
      Class: ${classType}\n
      Passengers: ${passengers.length}\n
      Fare: ${calculateFare()} INR`;

    // Convert to hex (MetaMask/Etherscan readable)
    const hexDescription = web3.utils.utf8ToHex(description);

    // Send transaction with metadata
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: '0x0000000000000000000000000000000000000000', // Burn address
        value: amountInWei,
        data: hexDescription, // Attach booking details
      }],
    });

    if (txHash) {
      await handleBooking(); // Complete booking
    }
  } catch (err) {
    setError(err.message.includes('rejected') 
      ? 'Transaction rejected' 
      : 'Payment failed');
  }
};
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
    }
  };

  const handleBooking = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trainId: id,
          passengers,
          classType
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate(`/booking-confirmation/${data.pnrNumber}`);
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Network error occurred');
    }
  };

  const calculateFare = () => {
    // Replace with your actual fare calculation logic
    const baseFare = {
      'SL': 500,
      '3A': 1200,
      '2A': 1800,
      '1A': 2500
    };
    return baseFare[classType] * passengers.length;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading train details...</p>
    </div>
  );
  
  if (error) return (
    <motion.div 
      className="error-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="error-card">
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    </motion.div>
  );
  
  if (!train) return (
    <div className="not-found-container">
      <h2>Train not found</h2>
      <button className="btn btn-secondary" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );

  return (
    <motion.div
      className="train-details-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="train-header">
        <motion.div 
          className="train-badge"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaTrain className="train-icon" />
          <span>{train.number}</span>
        </motion.div>
        <h1>{train.name}</h1>
        <div className="route-indicator">
          <span>{train.source_name} ({train.source_code})</span>
          <div className="route-line">
            <div className="route-dots"></div>
          </div>
          <span>{train.destination_name} ({train.destination_code})</span>
        </div>
      </div>

      <div className="train-info-grid">
        <div className="train-schedule">
          <div className="timing-card">
            <div className="timing-section">
              <div className="time-display departure">
                <IoMdTime className="time-icon" />
                <div>
                  <p className="time-label">Departure</p>
                  <p className="time-value">{formatTime(train.departure_time)}</p>
                </div>
              </div>
              <p className="station-name">{train.source_name}</p>
            </div>

            <div className="duration-display">
              <div className="duration-line"></div>
              <div className="duration-value">
                <FaClock className="clock-icon" />
                <span>{train.journey_duration}</span>
              </div>
            </div>

            <div className="timing-section">
              <div className="time-display arrival">
                <IoMdTime className="time-icon" />
                <div>
                  <p className="time-label">Arrival</p>
                  <p className="time-value">{formatTime(train.arrival_time)}</p>
                </div>
              </div>
              <p className="station-name">{train.destination_name}</p>
            </div>
          </div>

          <div className="route-section">
            <h2>
              <FaTrain className="section-icon" />
              Route Information
            </h2>
            <div className="stops-list">
              {train.stops.map((stop, index) => (
                <motion.div 
                  key={index} 
                  className={`stop-item ${selectedStop === index ? 'active' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedStop(index === selectedStop ? null : index)}
                >
                  <div className="stop-marker"></div>
                  <div className="stop-info">
                    <p className="stop-name">{stop.station_name} ({stop.station_code})</p>
                    <div className="stop-timings">
                      <span>Arr: {formatTime(stop.arrival_time)}</span>
                      <span>Dep: {formatTime(stop.departure_time)}</span>
                    </div>
                  </div>
                  <div className="stop-distance">
                    <GiPathDistance className="distance-icon" />
                    <span>{stop.distance_from_source} km</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="booking-section">
          <motion.div 
            className="booking-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            
            <h2>
              
              <FaUser className="section-icon" />
              Book Tickets
            </h2>

            <div className="class-selector">
              <label>Travel Class:</label>
              <div className="class-options">
                {[
                  { value: 'SL', label: 'Sleeper' },
                  { value: '3A', label: 'AC 3 Tier' },
                  { value: '2A', label: 'AC 2 Tier' },
                  { value: '1A', label: 'AC First Class' }
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`class-option ${classType === option.value ? 'active' : ''}`}
                    onClick={() => setClassType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="passengers-form">
              <h3>Passenger Details</h3>
              
              <AnimatePresence>
                {passengers.map((passenger, index) => (
                  <motion.div
                    key={index}
                    className="passenger-card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="passenger-header">
                      <h4>Passenger {index + 1}</h4>
                      {passengers.length > 1 && (
                        <button 
                          className="remove-passenger"
                          onClick={() => removePassenger(index)}
                        >
                          <FaMinus />
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Age</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          placeholder="Age"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button 
                type="button" 
                className="add-passenger-btn"
                onClick={addPassenger}
              >
                <FaPlus className="plus-icon" />
                Add Passenger
              </button>
            </div>

            <div className="fare-summary">
              <h3>Fare Summary</h3>
              <div className="fare-row">
                <span>Base Fare ({passengers.length} {passengers.length > 1 ? 'Passengers' : 'Passenger'})</span>
                <span><FaRupeeSign /> {calculateFare() / passengers.length} × {passengers.length}</span>
              </div>
              <div className="fare-row">
                <span>Reservation Charges</span>
                <span><FaRupeeSign /> 60</span>
              </div>
              <div className="fare-row total">
                <span>Total Amount</span>
                <span><FaRupeeSign /> {calculateFare() + 60}</span>
              </div>
            </div>
                <button 
                className="confirm-booking-btn"
                onClick={handleMetamaskPayment} // Replace handleBooking
                disabled={passengers.some(p => !p.name || !p.age)}
              >
                Pay and confirm the ticket with MetaMask
                <FaEthereum className="arrow-icon" /> {/* Add FaEthereum to imports */}
              </button>
            {/* <button 
              className="confirm-booking-btn"
              onClick={handleBooking}
              disabled={passengers.some(p => !p.name || !p.age)}
            >
              Confirm Booking
              <FaArrowRight className="arrow-icon" />
            </button> */}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainDetails;