import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrain, FaUser, FaCalendarAlt, FaChair, FaRupeeSign, FaArrowRight } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import './BookingCard.css';

const BookingCard = ({ booking, onClick }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed': return 'confirmed';
      case 'Cancelled': return 'cancelled';
      case 'Waiting': return 'waiting';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('en-IN', options);
  };

  return (
    <div className={`booking-card ${getStatusClass(booking.booking_status)}`} onClick={onClick}>
      <div className="booking-header">
        <div className="pnr-section">
          <h3>PNR: {booking.pnr_number}</h3>
          <span className="booking-date">
            <FaCalendarAlt className="icon" /> {formatDate(booking.booking_date)}
          </span>
        </div>
        <span className={`status-badge ${getStatusClass(booking.booking_status)}`}>
          {booking.booking_status}
        </span>
      </div>
      
      <div className="route-section">
        <div className="station">
          <span className="time">from</span>
          <span className="name">{booking.source_name}</span>
        </div>
        <div className="divider">
          <div className="line"></div>
          <FaTrain className="train-icon" />
        </div>
        <div className="station">
          <span className="time">to</span>
          <span className="name">{booking.destination_name}</span>
        </div>
      </div>
      
      <div className="booking-details">
        <div className="detail-row">
          <span className="detail-item">
            <FaUser className="icon" /> {booking.passenger_name}
          </span>
          <span className="detail-item">
            <FaChair className="icon" /> {booking.seat_number} | {booking.class_type}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-item">
            <FaTrain className="icon" /> {booking.train_name} ({booking.train_number})
          </span>
          <span className="detail-item fare">
            <FaRupeeSign className="icon" /> {booking.fare}
          </span>
        </div>
      </div>
      
      <div className="booking-actions">
        <Link 
          to={`/booking-confirmation/${booking.pnr_number}`} 
          className="view-details-btn"
          onClick={(e) => e.stopPropagation()}
        >
          View Details <FaArrowRight className="arrow-icon" />
        </Link>
      </div>
    </div>
  );
};

export default BookingCard;