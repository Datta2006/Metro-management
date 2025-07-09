import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TrainCardList from './TrainCard';
import BookingCard from './BookingCard';
import SearchForm from './SearchForm';
import Feedback from './Feedback1';
import './Dashboard.css';


import ContactUs from './Contact';

import FAQ from './FAQ';

const Dashboard = ({ setAuthentication, user }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState({
    trains: false,
    bookings: false
  });
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    classType: 'SL'
  });
  const navigate = useNavigate();

  // Particle.js initialization
  useEffect(() => {
    // Load particles.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize particles after script loads
      if (window.particlesJS) {
        window.particlesJS('particles-container', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6c63ff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#6c63ff",
              opacity: 0.4,
              width: 1
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "repulse" },
              onclick: { enable: true, mode: "push" },
              resize: true
            }
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Clean up
      document.body.removeChild(script);
      const particles = document.getElementById('particles-container');
      if (particles) particles.innerHTML = '';
    };
  }, []);

  // const connectWallet = async () => {
  //   try {
  //     const provider = await detectEthereumProvider();
  //     if (provider) {
  //       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  //       setWalletAddress(accounts[0]);
  //     } else {
  //       alert('MetaMask not detected. Please install it.');
  //     }
  //   } catch (error) {
  //     console.error('MetaMask connection error:', error);
  //     alert('MetaMask connection failed');
  //   }
  // };
  
  useEffect(() => {
    // connectWallet();
    fetchTrains();
    fetchBookings();
  }, []);

  const fetchTrains = async (params = {}) => {
    setIsLoading(prev => ({ ...prev, trains: true }));
    setError('');
    
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`http://localhost:5000/api/trains/search?${query}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTrains(data);
      } else {
        setError(data.error || 'Failed to fetch trains');
        if (response.status === 401) handleLogout();
      }
    } catch (err) {
      setError('Network error occurred while fetching trains');
    } finally {
      setIsLoading(prev => ({ ...prev, trains: false }));
    }
  };

  const fetchBookings = async () => {
    setIsLoading(prev => ({ ...prev, bookings: true }));
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data);
      } else {
        setError(data.error || 'Failed to fetch bookings');
        if (response.status === 401) handleLogout();
      }
    } catch (err) {
      setError('Network error occurred while fetching bookings');
    } finally {
      setIsLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrains(searchParams);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthentication(false);
    navigate('/login');
  };

  const refreshBookings = () => {
    fetchBookings();
  };

  return (
    
    <div className="dashboard-root">
      {/* Particle.js container */}
      <div id="particles-container" className="particles-background"></div>
      
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <header className="header">
          <div className="logo">
            <h1>Metro Booking System</h1>
          </div>
          <nav className="nav-links">
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </nav>
        </header>
        
        <main>
          
{/*           
          {walletAddress && (
            <div className="wallet-display">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 12C21 13.1046 20.1046 14 19 14H5C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10H19C20.1046 10 21 10.8954 21 12Z" fill="#3D7BFF"/>
                <path d="M17 8V16M7 8V16" stroke="#3D7BFF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>
                <span>Connected:</span> {walletAddress}
              </p>
            </div>
          )} */}
          
          <section className="search-section">
            <h2>Search Trains</h2>
            <SearchForm 
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              handleSearch={handleSearch}
            />
          </section>

          {isLoading.trains && <div className="spinner"></div>}
          {error && <div className="error-message">{error}</div>}

          <section className="trains-section">
            <div className="section-header">
              <h2 className="yourbooking">Available Trains</h2>
              {trains.length > 0 && (
                <button onClick={() => fetchTrains()} className="btn btn-refresh">
                  Refresh
                </button>
              )}
            </div>
            <TrainCardList 
              trains={trains} 
              classType={searchParams.classType}
              onClick={(trainId) => navigate(`/trains/${trainId}`)}
            />
          </section>

          <section className="bookings-section">
            <div className="section-header">
              <h2 className="yourbooking">Your Bookings</h2>
              <button 
                onClick={refreshBookings} 
                className="btn btn-refresh"
                disabled={isLoading.bookings}
              >
                {isLoading.bookings ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {isLoading.bookings ? (
              <div className="spinner"></div>
            ) : bookings.length === 0 ? (
              <p>No bookings found. Book a train to see your bookings here.</p>
            ) : (
              <div className="bookings-grid">
                {bookings.map(booking => (
                  <BookingCard 
                    key={booking.pnr_number} 
                    booking={booking} 
                    onClick={() => navigate(`/booking-confirmation/${booking.pnr_number}`)}
                  />
                ))}
              </div>
            )}

            <div className="faq-map">
              <FAQ/>
            </div>

            <section className="feedback-section">
              <h2>We'd love your feedback</h2>
              <div className="feedback-root">
                <Feedback />
              </div>
            </section>
            
            <div className="contact-section">
              {/* <div className="direct-contact">
                <h3>Direct contact? 9am to 5pm</h3>
                <a 
                  href="https://tawk.to/chat/67fe7349d9917b190cb96c2e/default" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-btn"
                >
                  Click here
                </a>
              </div> */}
              <ContactUs/>
            </div>
          </section>
        </main>
      </motion.div>
    </div>
  );
};

export default Dashboard;