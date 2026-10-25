import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Shield, ArrowRight, UserCheck, Calendar, MapPin, Tag } from 'lucide-react';

export default function BookingModal({
  isOpen,
  onClose,
  type,
  item,
  selectedClass,
  selectedSeats,
  customData = {},
}) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Common Passenger / Contact States initialized with user profile if logged in
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: '28',
    gender: 'Male',
    berthPreference: 'No Preference',
    catering: false,
    boardingPoint: item?.boardingPoints?.[0]?.location || '',
    droppingPoint: item?.droppingPoints?.[0]?.location || '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guestsCount: 1,
    travelDate: new Date().toISOString().split('T')[0],
    specialRequests: '',
  });

  if (!isOpen || !item) return null;

  // Compute total price based on vertical
  let totalPrice = 0;
  if (type === 'flight') {
    const classObj = item.classes?.find((c) => c.name === selectedClass) || item.classes?.[0];
    totalPrice = (classObj ? classObj.price : 100) + 35; // Fare + taxes
  } else if (type === 'train') {
    const classObj = item.classes?.find((c) => c.classCode === selectedClass) || item.classes?.[0];
    const baseFare = classObj ? classObj.fare : 50;
    const cateringFee = formData.catering ? 15 : 0;
    totalPrice = baseFare + cateringFee;
  } else if (type === 'bus') {
    totalPrice = (selectedSeats || []).reduce((sum, seatNum) => {
      const s = item.seats?.find((st) => st.seatNumber === seatNum);
      return sum + (s ? s.price : item.basePrice || 40);
    }, 0);
  } else if (type === 'hotel') {
    const roomObj = item.rooms?.find((r) => r.roomType === selectedClass) || item.rooms?.[0];
    const pricePerNight = roomObj ? roomObj.pricePerNight : item.startingPrice || 150;
    const nights = Math.max(
      1,
      Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)) || 1
    );
    totalPrice = pricePerNight * nights;
  } else if (type === 'package') {
    const base = item.price || 999;
    totalPrice = base * (Number(formData.guestsCount) || 1);
  }

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to proceed with booking checkout.', 'info');
      onClose();
      navigate('/login?redirect=/payment');
      return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please complete all contact details.', 'error');
      return;
    }

    // Assemble booking checkout payload
    const checkoutPayload = {
      type,
      item,
      selectedClass,
      selectedSeats,
      totalPrice,
      formData,
      bookingTime: new Date().toISOString(),
    };

    // Store in session storage & redirect to payment
    sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutPayload));
    onClose();
    navigate('/payment');
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-dialog animate-scale-up">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className="badge-vertical-pill">{type.toUpperCase()} BOOKING</span>
            <h3>
              {type === 'flight' && `${item.airline} (${item.flightNumber})`}
              {type === 'train' && `${item.trainNumber} - ${item.trainName}`}
              {type === 'bus' && `${item.operatorName}`}
              {type === 'hotel' && `${item.name}`}
              {type === 'package' && `${item.title || item.name}`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleProceed} className="modal-form-content">
          <div className="booking-summary-banner">
            <div className="summary-trip-details">
              {type === 'flight' && (
                <p>
                  <strong>{item.fromCity} ({item.fromCode})</strong> &rarr;{' '}
                  <strong>{item.toCity} ({item.toCode})</strong> | Class: <span className="text-highlight">{selectedClass}</span>
                </p>
              )}
              {type === 'train' && (
                <p>
                  <strong>{item.fromCity}</strong> &rarr; <strong>{item.toCity}</strong> | Class:{' '}
                  <span className="text-highlight">{selectedClass}</span>
                </p>
              )}
              {type === 'bus' && (
                <p>
                  <strong>{item.fromCity}</strong> &rarr; <strong>{item.toCity}</strong> | Seats:{' '}
                  <span className="text-highlight">{selectedSeats?.join(', ')}</span>
                </p>
              )}
              {type === 'hotel' && (
                <p>
                  <MapPin size={14} className="inline-icon" /> {item.location}, {item.city} | Tier:{' '}
                  <span className="text-highlight">{selectedClass || 'Deluxe'}</span>
                </p>
              )}
              {type === 'package' && (
                <p>
                  <MapPin size={14} className="inline-icon" /> {item.destination} | Duration: {item.duration}
                </p>
              )}
            </div>
            <div className="summary-fare-badge">
              <span className="fare-label">Payable Total</span>
              <span className="fare-num">₹{totalPrice}</span>
            </div>
          </div>

          {/* Passenger & Contact Fields */}
          <div className="form-section-title">
            <UserCheck size={18} />
            <span>Lead Passenger & Contact Info</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Rajiv Kumar"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="rajiv@example.com"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 9065912445"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Travel Date for Flights / Trains / Packages */}
            {(type === 'flight' || type === 'train' || type === 'package' || type === 'bus') && (
              <div className="form-group">
                <label>Date of Journey *</label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control"
                />
              </div>
            )}

            {/* Train Specific: Berth Preference */}
            {type === 'train' && (
              <div className="form-group">
                <label>Berth Preference</label>
                <select
                  name="berthPreference"
                  value={formData.berthPreference}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="No Preference">No Preference</option>
                  <option value="Lower">Lower Berth</option>
                  <option value="Middle">Middle Berth</option>
                  <option value="Upper">Upper Berth</option>
                  <option value="Side Lower">Side Lower</option>
                  <option value="Side Upper">Side Upper</option>
                </select>
              </div>
            )}

            {/* Hotel Specific: Dates & Guests */}
            {type === 'hotel' && (
              <>
                <div className="form-group">
                  <label>Check-In Date *</label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Check-Out Date *</label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleChange}
                    required
                    min={formData.checkInDate}
                    className="form-control"
                  />
                </div>
              </>
            )}
          </div>

          {/* Train Catering Checkbox */}
          {type === 'train' && (
            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="catering"
                  checked={formData.catering}
                  onChange={handleChange}
                />
                <span>Include Fresh Express Catering & Meals (+₹15 per traveler)</span>
              </label>
            </div>
          )}

          {/* Bus Boarding / Dropping Selector */}
          {type === 'bus' && (
            <div className="form-grid-2">
              <div className="form-group">
                <label>Boarding Point</label>
                <select
                  name="boardingPoint"
                  value={formData.boardingPoint}
                  onChange={handleChange}
                  className="form-control"
                >
                  {item.boardingPoints?.map((bp, i) => (
                    <option key={i} value={bp.location}>
                      {bp.location} ({bp.time})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dropping Point</label>
                <select
                  name="droppingPoint"
                  value={formData.droppingPoint}
                  onChange={handleChange}
                  className="form-control"
                >
                  {item.droppingPoints?.map((dp, i) => (
                    <option key={i} value={dp.location}>
                      {dp.location} ({dp.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <div className="security-notice">
              <Shield size={16} /> <span>100% Encrypted & Safe Reservation</span>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn btn-outline-light" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-icon">
                <span>Continue to Checkout (₹{totalPrice})</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
