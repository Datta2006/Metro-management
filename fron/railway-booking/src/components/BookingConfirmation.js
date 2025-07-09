import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import './BookingConfirmation.css';

const BookingConfirmation = ({ user }) => {
  const { pnr } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${pnr}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setBooking(data);
        } else {
          setError(data.error || 'Failed to fetch booking details');
        }
      } catch (err) {
        console.error('Fetch booking error:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [pnr]);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add simple content - just the name as requested
    doc.setFontSize(20);
    doc.text('Train Booking Ticket', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Passenger Name: ${booking.passenger_name}`, 20, 40);
    
    // Add some random content to make it look like a ticket
    doc.text(`PNR: ${booking.pnr_number}`, 20, 50);
    doc.text(`Train: ${booking.train_name} (${booking.train_number})`, 20, 60);
    doc.text(`From: ${booking.source_name} to ${booking.destination_name}`, 20, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Add a simple border
    doc.rect(10, 10, 190, 80);
    
    // Save the PDF
    doc.save(`ticket_${booking.pnr_number}.pdf`);
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <motion.div
      className="booking-confirmation-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="confirmation-card">
      <div className="confirmation-header">
          <h1>Booking Confirmed!</h1>
          <p className="pnr">PNR: {booking.pnr_number}</p>
        </div>

        <div className="confirmation-details">
          <div className="train-info">
            <h2>{booking.train_name} ({booking.train_number})</h2>
            <p>{booking.source_name} to {booking.destination_name}</p>
            <div className="timing-info">
              <p>Departure: {booking.departure_time}</p>
              <p>Arrival: {booking.arrival_time}</p>
            </div>
          </div>

          <div className="passenger-info">
            <h3>Passenger Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Seat</th>
                  <th>Class</th>
                  <th>Fare</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{booking.passenger_name}</td>
                  <td>{booking.passenger_age}</td>
                  <td>{booking.passenger_gender}</td>
                  <td>{booking.seat_number}</td>
                  <td>{booking.class_type}</td>
                  <td>₹{booking.fare}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="payment-info">
            <h3>Payment Details</h3>
            <p>Status: <span className="status-success">Success</span></p>
            <p>Amount Paid: ₹{booking.fare}</p>
          </div>
        </div>

        
        <div className="confirmation-actions">
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
          <button className="btn btn-secondary" onClick={generatePDF}>
            Print Ticket
          </button>
          <button className="btn btn-danger">
            Cancel Ticket
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingConfirmation;