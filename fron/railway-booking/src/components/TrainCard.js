import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TrainCard.css';

const TrainCard = ({ train, classType, onClick }) => {
  const baseFare = Math.round(train.fare_per_km * (train.distance_from_source / 1000));
  let fare = baseFare;

  if (classType === '3A') fare = Math.round(1000 * 1.5);
  else if (classType === '2A') fare = Math.round(1000 * 2);
  else if (classType === '1A') fare = Math.round(1000* 3);
  else fare=Math.round(1000*2);
  

  return (
    <div className="train-card" onClick={onClick}>
      <div className="train-header">
        <h3>{train.name}</h3>
        <p className="train-number">{train.number}</p>
      </div>

      <div className="train-route">
        <div className="train-stations">
          <p className="station">{train.source_name}</p>
          <div className="route-line">
            <div className="duration">{train.journey_duration}</div>
          </div>
          <p className="station">{train.destination_name}</p>
        </div>
      </div>

      <div className="train-timings">
        <p><strong>Dep:</strong> {train.departure_time}</p>
        <p><strong>Arr:</strong> {train.arrival_time}</p>
      </div>

      <div className="train-availability">
        <p>🎫 {train.available_seats} seats left</p>
        <p className="fare">₹{fare} <small>({classType})</small></p>
      </div>

      <div className="train-actions">
        <Link 
          to={`/trains/${train.id}`} 
          className="btn btn-primary"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const TrainCardList = ({ trains, classType, onClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  
  const totalPages = Math.ceil(trains.length / cardsPerPage);
  const currentCards = trains.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="train-card-list">
      <div className="train-cards-grid">
        {currentCards.map(train => (
          <TrainCard 
            key={train.id} 
            train={train} 
            classType={classType}
            onClick={() => onClick(train.id)}
          />
        ))}
      </div>

      {trains.length > cardsPerPage && (
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainCardList;