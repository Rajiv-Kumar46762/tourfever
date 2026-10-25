import React, { useState } from 'react';
import { Armchair, CheckCircle } from 'lucide-react';

export default function SeatSelector({ bus, selectedSeats, onToggleSeat }) {
  const [activeDeck, setActiveDeck] = useState('lower');

  const lowerSeats = bus?.seats?.filter((s) => s.deck === 'lower') || [];
  const upperSeats = bus?.seats?.filter((s) => s.deck === 'upper') || [];

  const seatsToDisplay = activeDeck === 'lower' ? lowerSeats : upperSeats;

  return (
    <div className="seat-selector-wrapper">
      <div className="deck-toggle-tabs">
        <button
          type="button"
          className={`deck-tab-btn ${activeDeck === 'lower' ? 'active' : ''}`}
          onClick={() => setActiveDeck('lower')}
        >
          Lower Deck ({lowerSeats.filter((s) => !s.isBooked).length} Available)
        </button>
        <button
          type="button"
          className={`deck-tab-btn ${activeDeck === 'upper' ? 'active' : ''}`}
          onClick={() => setActiveDeck('upper')}
        >
          Upper Deck ({upperSeats.filter((s) => !s.isBooked).length} Available)
        </button>
      </div>

      <div className="seat-legend">
        <div className="legend-pill">
          <span className="seat-box available"></span> Available
        </div>
        <div className="legend-pill">
          <span className="seat-box selected"></span> Selected
        </div>
        <div className="legend-pill">
          <span className="seat-box booked"></span> Booked
        </div>
      </div>

      <div className="bus-chassis">
        <div className="steering-area">
          <span className="steering-wheel">⎈ Driver Cabin</span>
          <span className="deck-label">{activeDeck.toUpperCase()} DECK</span>
        </div>

        <div className="seats-grid">
          {seatsToDisplay.length > 0 ? (
            seatsToDisplay.map((seat) => {
              const isSelected = selectedSeats.includes(seat.seatNumber);
              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  disabled={seat.isBooked}
                  onClick={() => onToggleSeat(seat)}
                  className={`bus-seat-card ${seat.isBooked ? 'booked' : ''} ${
                    isSelected ? 'selected' : ''
                  } ${seat.type}`}
                  title={`${seat.seatNumber} (${seat.type}) - ₹${seat.price}`}
                >
                  <div className="seat-icon-row">
                    <Armchair size={16} />
                    <span className="seat-num">{seat.seatNumber}</span>
                  </div>
                  <span className="seat-price">₹{seat.price}</span>
                  {isSelected && <CheckCircle size={14} className="seat-selected-badge" />}
                </button>
              );
            })
          ) : (
            <div className="no-seats-msg">No seats configured for this deck.</div>
          )}
        </div>
      </div>

      <div className="selected-summary-strip">
        <div className="summary-left">
          <span>Selected Seats: </span>
          {selectedSeats.length > 0 ? (
            <strong className="seat-tags">
              {selectedSeats.map((s) => (
                <span key={s} className="seat-badge">{s}</span>
              ))}
            </strong>
          ) : (
            <em className="text-muted">None selected yet</em>
          )}
        </div>
        <div className="summary-right">
          <span>Total Fare: </span>
          <strong className="text-highlight">
            ₹{selectedSeats.reduce((sum, seatNum) => {
              const s = bus?.seats?.find((item) => item.seatNumber === seatNum);
              return sum + (s ? s.price : bus.basePrice);
            }, 0)}
          </strong>
        </div>
      </div>
    </div>
  );
}
