import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TrainCardList from './TrainCard';
import BookingCard from './BookingCard';
import SearchForm from './SearchForm';
import Feedback from './Feedback1';
import './Dashboard.css';
import TrainSlider from './TrainSlider';
import detectEthereumProvider from '@metamask/detect-provider';
import MapComponent from './Map';
import TextHoverEffect from './text'
import 'leaflet/dist/leaflet.css';
import ContactUs from './Contact';
import ImportantNotice from './ImportantNotice';
import FAQ from './FAQ';


const Dashboard = ({ setAuthentication, user }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState({
    trains: false,
    bookings: false
  });
  const connectWallet = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        console.log('Connected MetaMask address:', accounts[0]);
      } else {
        alert('MetaMask not detected. Please install it.');
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      alert('MetaMask connection failed');
    }
  };
  
  useEffect(() => {
    connectWallet();
    
  }, []);
    
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    classType: 'SL'
  });
  const [selectedTrainForFeedback, setSelectedTrainForFeedback] = useState(null);
  const navigate = useNavigate();

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
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error('Fetch trains error:', err);
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
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings:', data.error);
        setError(data.error || 'Failed to fetch bookings');
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('Network error occurred while fetching bookings');
    } finally {
      setIsLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  useEffect(() => {
    fetchTrains();
    fetchBookings();
  }, []);

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

  const handleOpenFeedback = (train) => {
    setSelectedTrainForFeedback(train);
  };

  const handleCloseFeedback = () => {
    setSelectedTrainForFeedback(null);
  };
  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://tawk.to/chat/67fe7349d9917b190cb96c2e/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    ><div>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
          (function () {
            var s1 = document.createElement("script"),
                s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = "https://embed.tawk.to/b363b62eba670696d21259a97e56fe9023fe9812/1hvh1f5n1";
            s1.charset = "UTF-8";
            s1.setAttribute("crossorigin", "*");
            s0.parentNode.insertBefore(s1, s0);
          })();
        `,
      }}
    />
  </div>
      
      <header className="header">
        <div className="logo">
        {/* <div className="p-10">
      <TextHoverEffect 
        text="Datta" 
        duration={0.4} // Adjust animation speed
      />
    </div> */}
          <h1>Metro Booking System</h1>
          

        </div>
        <nav className="nav-links">
          <Link to="/profile" className="nav-link">Profile</Link>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </nav>
      </header>
     
      <main>
      
       
        <TrainSlider/>
        <br></br>
        <ImportantNotice />
        <br></br>
        {walletAddress && (
  <div style={{
    backgroundColor: '#1E2A3A',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '10px',
    borderLeft: '3px solid #3D7BFF',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path d="M21 12C21 13.1046 20.1046 14 19 14H5C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10H19C20.1046 10 21 10.8954 21 12Z" fill="#3D7BFF"/>
      <path d="M17 8V16M7 8V16" stroke="#3D7BFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <p style={{
      margin: 0,
      fontSize: '0.85em',
      color: '#E0E0E0',
      fontFamily: 'monospace',
      wordBreak: 'break-all'
    }}>
      <span style={{ color: '#3D7BFF', fontWeight: '600' }}>Connected:</span> {walletAddress}
    </p>
  </div>
)}
        <br/>
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
            <h2>Available Trains</h2>
            {trains.length > 0 && (
              <button 
                onClick={() => fetchTrains()} 
                className="btn btn-refresh"
              >
                Refresh
              </button>
            )}
          </div>
          <TrainCardList 
            trains={trains} 
            classType={searchParams.classType}
            onClick={(trainId) => navigate(`/trains/${trainId}`)}
            onFeedbackClick={handleOpenFeedback}
          />
        </section>

        <section className="bookings-section">
          <div className="section-header">
            <h2>Your Bookings</h2>
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

<FAQ/>
<section className="feedback-section">
  <br></br>
<MapComponent/>
<br></br>
<h2>We'd love your feedback</h2>
<div className="feedback-root"><Feedback /></div>
  
  
</section>
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '20px'
}}>
  {/* Wallet Address Display (your existing code) */}
  {walletAddress && (
    <div style={{
      backgroundColor: '#1E2A3A',
      padding: '12px',
      borderRadius: '8px',
      borderLeft: '3px solid #3D7BFF'
    }}>
      <p style={{ margin: 0, fontSize: '0.85em', color: '#E0E0E0' }}>
        <b style={{ color: '#3D7BFF' }}>Wallet:</b> {walletAddress}
      </p>
    </div>
  )}

  {/* New Contact Button Column */}
  <div style={{
    backgroundColor: '#1E2A3A',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '3px solid #FFA726' // Orange accent for contact
  }}>
    <h3 style={{ 
      marginTop: 0,
      marginBottom: '12px',
      color: '#FFA726',
      fontSize: '1em'
    }}>
      Direct contact?? 9am to 5pm
    </h3>
    <a 
      href="https://tawk.to/chat/67fe7349d9917b190cb96c2e/default" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        backgroundColor: '#FFA726',
        color: '#0A0A12',
        padding: '10px 16px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.9em',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: '#FF9800',
          transform: 'translateY(-1px)'
        }
      }}
    >
      click here
    </a>
  </div>
</div>
<ContactUs/>
        </section>
        {/* <section className="feedback-section">
          <h2>
            {selectedTrainForFeedback 
              ? `Leave Feedback for ${selectedTrainForFeedback.name}`
              : "Leave Feedback"}
          </h2>
          {selectedTrainForFeedback ? (
            <Feedback 
              trainId={selectedTrainForFeedback.id}
              onSuccess={() => {
                setSelectedTrainForFeedback(null);
                // Optional: show success message
              }}
            />
          ) : (
            <div className="feedback-prompt">
              <p>Please select a train from the list above to leave feedback</p>
            </div>
          )}
        </section> */}
        
      </main>

      {/* Feedback Modal */}
      {/* {selectedTrainForFeedback && (
        <div className="feedback-modal">
          <div className="feedback-modal-content">
            <button 
              className="close-feedback-btn" 
              onClick={handleCloseFeedback}
            >
              &times;
            </button>
            <Feedback 
              trainId={selectedTrainForFeedback.id} 
              onClose={handleCloseFeedback}
            />
          </div>
          
        </div>
      )} */}
      
    </motion.div>
  );
};

export default Dashboard;