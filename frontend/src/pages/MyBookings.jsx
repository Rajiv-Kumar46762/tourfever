import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { 
  Ticket, 
  Search, 
  Calendar, 
  MapPin, 
  Plane, 
  Train, 
  Bus, 
  Hotel, 
  Package, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  User,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(user?.email || '');

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) {
        if (searchQuery.includes('@')) {
          params.email = searchQuery;
        } else {
          params.phone = searchQuery;
        }
      }
      if (activeTypeFilter !== 'all') {
        params.type = activeTypeFilter;
      }

      const data = await api.getMyBookings(params);
      if (data.success && (data.bookings || data.data)) {
        setBookings(data.bookings || data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setSearchQuery(user.email);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [activeTypeFilter, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!bookingToCancel) return;
    setCancelling(true);

    try {
      await api.cancelBooking(
        bookingToCancel.type,
        bookingToCancel.bookingId,
        cancelReason
      );
      showToast('Booking successfully cancelled. Refund processed to original payment method.', 'success');
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getVerticalIcon = (type) => {
    switch (type) {
      case 'flight': return <Plane size={18} />;
      case 'train': return <Train size={18} />;
      case 'bus': return <Bus size={18} />;
      case 'hotel': return <Hotel size={18} />;
      case 'package': return <Package size={18} />;
      default: return <Ticket size={18} />;
    }
  };

  return (
    <div className="my-bookings-page container py-4">
      {/* Header */}
      <div className="page-header-banner">
        <div className="header-badge">
          <Ticket size={16} /> <span>UNIFIED RESERVATIONS PORTAL</span>
        </div>
        <h1>My Travel Bookings & Tickets</h1>
        <p>Review e-tickets across flights, trains, buses, and hotels. Manage modifications and cancellations.</p>
      </div>

      {/* Lookup Bar */}
      <div className="search-filter-box mb-4">
        <form onSubmit={handleSearchSubmit} className="search-row-grid" style={{ gridTemplateColumns: '1fr auto auto' }}>
          <div className="form-group">
            <label>Lookup by Registered Email or Phone</label>
            <div className="input-with-icon">
              <Search size={18} />
              <input
                type="text"
                placeholder="Enter email (e.g. rajiv@example.com) or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-search-flights">
            <Search size={18} /> <span>Lookup Bookings</span>
          </button>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={fetchBookings}
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="bookings-type-tabs mb-4">
        {['all', 'flight', 'train', 'bus', 'hotel', 'package'].map((t) => (
          <button
            key={t}
            className={`b-type-pill ${activeTypeFilter === t ? 'active' : ''}`}
            onClick={() => setActiveTypeFilter(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Retrieving your confirmed travel records from database...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state-box">
          <FileText size={48} className="text-muted" />
          <h3>No Bookings Found</h3>
          <p>We couldn't find reservations under this contact filter. Book a trip to see tickets here!</p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => (window.location.href = '/flights')}
          >
            Explore Flights &rarr;
          </button>
        </div>
      ) : (
        <div className="bookings-cards-list">
          {bookings.map((b) => (
            <div key={b.bookingId || b.id} className="booking-record-card animate-fade-in">
              <div className="record-header">
                <div className="record-type-pill">
                  {getVerticalIcon(b.type)}
                  <span>{b.typeName || b.type.toUpperCase()}</span>
                </div>

                <div className="record-ref-tags">
                  <span className="ref-badge">PNR / Ref: <strong>{b.referenceNumber || b.pnr}</strong></span>
                  <span className="booking-id-tag">ID: {b.bookingId}</span>
                </div>

                <div className="status-badge-container">
                  {b.status === 'CONFIRMED' ? (
                    <span className="badge-confirmed">
                      <CheckCircle size={14} /> CONFIRMED
                    </span>
                  ) : (
                    <span className="badge-cancelled">
                      <XCircle size={14} /> CANCELLED
                    </span>
                  )}
                </div>
              </div>

              <div className="record-body-grid">
                <div className="record-main-col">
                  <h3 className="record-title">{b.title}</h3>
                  <p className="record-subtitle">{b.subtitle}</p>
                  <div className="record-meta-strip">
                    <span>
                      <Calendar size={14} /> Journey Date:{' '}
                      <strong>{new Date(b.date).toLocaleDateString()}</strong>
                    </span>
                    {b.returnDate && (
                      <span>
                        Return Date: <strong>{new Date(b.returnDate).toLocaleDateString()}</strong>
                      </span>
                    )}
                    {b.details?.passengers && b.details.passengers.length > 0 && (
                      <span style={{ color: 'var(--text-main)' }}>
                        <User size={14} /> Passenger: <strong>{b.details.passengers[0].fullName}</strong>
                        {b.details.passengers[0].allocatedCoach && (
                          <span style={{ color: '#38bdf8', marginLeft: '6px' }}>
                            ({b.details.passengers[0].allocatedCoach} • {b.details.passengers[0].allocatedBerth})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="record-side-col">
                  <div className="fare-box">
                    <span className="fare-lbl">Total Paid</span>
                    <strong className="fare-amt">₹{b.amount} INR</strong>
                    <span className="payment-tag">Status: {b.paymentStatus || 'PAID'}</span>
                  </div>

                  {b.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleOpenCancelModal(b)}
                    >
                      <Trash2 size={14} /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && bookingToCancel && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-dialog modal-sm animate-scale-up">
            <div className="modal-header">
              <div className="modal-title-box">
                <AlertTriangle size={20} className="text-danger-inline" />
                <h3>Cancel Travel Reservation</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setCancelModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="modal-form-content">
              <p className="cancel-warning-text">
                Are you sure you want to cancel booking <strong>{bookingToCancel.bookingId}</strong> ({bookingToCancel.title})?
              </p>

              <div className="form-group mb-3">
                <label>Reason for Cancellation *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-control"
                >
                  <option value="Change of travel schedule">Change of travel schedule</option>
                  <option value="Booked by mistake">Booked by mistake</option>
                  <option value="Found better itinerary">Found better itinerary</option>
                  <option value="Personal emergency">Personal emergency</option>
                </select>
              </div>

              <div className="refund-estimate-pill">
                <span>Estimated Refund Amount:</span>
                <strong>₹{Math.max(0, bookingToCancel.amount - 20)} INR</strong>
                <small>(Standard ₹20 cancellation processing fee applies)</small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => setCancelModalOpen(false)}
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="btn btn-danger"
                >
                  {cancelling ? 'Processing Cancellation...' : 'Confirm & Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
