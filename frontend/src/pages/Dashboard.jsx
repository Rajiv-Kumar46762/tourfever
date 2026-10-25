import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  BarChart3, 
  Package, 
  Award, 
  IndianRupee, 
  Compass, 
  MessageSquare,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  CreditCard,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Train as TrainIcon,
  Heart,
  Trash2,
  Star
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDashboard()
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard metrics', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const stats = dashboardData?.stats || {
    totalSpent: 0,
    confirmedBookingsCount: 0,
    totalInquiries: 0,
    rewardPoints: 0,
  };

  const allBookings = dashboardData?.bookings || dashboardData?.packageBookings || [];
  const inquiries = dashboardData?.inquiries || [];
  const payments = dashboardData?.payments || [];
  const wishlist = dashboardData?.wishlist || [];

  const handleRemoveFromWishlist = async (item) => {
    try {
      await api.removeFromWishlist(item._id);
      setDashboardData((prev) => ({
        ...prev,
        wishlist: prev?.wishlist ? prev.wishlist.filter((w) => w._id !== item._id) : []
      }));
      showToast(`"${item.packageTitle}" removed from saved wishlist.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove from wishlist.', 'error');
    }
  };

  const handleBookWishlistItem = (item) => {
    const defaultDeparture = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
    const checkoutPayload = {
      type: 'package',
      item: {
        id: item.packageId,
        title: item.packageTitle,
        destination: item.destination,
        duration: item.duration,
        price: item.price,
        image: item.image || '/images/packege-1.jpg',
        rating: item.rating || 4.9,
        inclusions: ['Roundtrip Sea Plane Transfers', 'Overwater Pool Villa', 'All-Inclusive Dining'],
      },
      selectedClass: 'All-Inclusive',
      totalPrice: item.price,
      formData: {
        name: user?.name || user?.username || 'Valued Traveler',
        email: user?.email || 'traveler@tourfever.com',
        phone: user?.phone || '+91 9876543210',
        age: '28',
        gender: 'Male',
        travelDate: defaultDeparture,
        passengersCount: 1,
        specialRequests: '',
      },
      bookingTime: new Date().toISOString(),
    };
    sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutPayload));
    localStorage.setItem('pendingCheckout', JSON.stringify(checkoutPayload));
    navigate('/payment');
  };

  return (
    <div className="dashboard-page container py-4">
      {/* Header */}
      <div className="page-header-banner">
        <div className="header-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <BarChart3 size={16} /> 
          <span>{user ? `ACCOUNT: ${(user.name || user.username).toUpperCase()}` : 'GUEST EXPLORER'}</span>
          {user?.email && (
            <span style={{ opacity: 0.85, fontSize: '0.78rem', borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: '8px' }}>
              {user.email}
            </span>
          )}
        </div>
        <h1>Traveler Activity & Insights Dashboard</h1>
        <p>
          {user
            ? `Verified activity record for ${user.name || user.username}: completed holiday bookings, express train tickets, concierge enquiries, and payments.`
            : `Track your completed holiday bookings, express train tickets, custom travel enquiries, and payment history.`}
        </p>
        {!user && (
          <div style={{ marginTop: '12px' }}>
            <Link to="/login?redirect=/dashboard" className="btn btn-primary btn-sm">
              Sign In to View Your Account Dashboard &rarr;
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state text-center py-5">
          <div className="spinner mb-3"></div>
          <p style={{ color: 'var(--text-muted)' }}>Querying database for real user activity...</p>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards - Strictly Real Data */}
          <div className="kpi-cards-grid mb-4">
            <div className="kpi-card animate-scale-up">
              <div className="kpi-icon-box bg-gradient-coral">
                <Package size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Completed Bookings</span>
                <strong className="kpi-value">{stats.confirmedBookingsCount}</strong>
                <span className="kpi-sub">Confirmed in Database</span>
              </div>
            </div>

            <div className="kpi-card animate-scale-up">
              <div className="kpi-icon-box bg-gradient-gold">
                <IndianRupee size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Total Spend</span>
                <strong className="kpi-value">₹{stats.totalSpent.toLocaleString('en-IN')} <small>INR</small></strong>
                <span className="kpi-sub">Verified Payment Volume</span>
              </div>
            </div>

            <div className="kpi-card animate-scale-up">
              <div className="kpi-info">
                <span className="kpi-label">Loyalty Reward Points</span>
                <strong className="kpi-value">{stats.rewardPoints.toLocaleString('en-IN')} <small>PTS</small></strong>
                <span className="kpi-sub">1 pt per ₹50 spent</span>
              </div>
            </div>

            <div className="kpi-card animate-scale-up">
              <div className="kpi-icon-box bg-gradient-blue">
                <MessageSquare size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Travel Enquiries</span>
                <strong className="kpi-value">{stats.totalInquiries}</strong>
                <span className="kpi-sub">Concierge Leads Logged</span>
              </div>
            </div>

            <div className="kpi-card animate-scale-up">
              <div className="kpi-icon-box" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>
                <Heart size={24} fill="#ffffff" color="#ffffff" />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Saved Wishlist</span>
                <strong className="kpi-value">{wishlist.length}</strong>
                <span className="kpi-sub">Favorite Trips Bookmarked</span>
              </div>
            </div>
          </div>

          {/* Section 1: Completed Bookings (Packages & Trains) */}
          <div className="mb-4">
            <div className="section-header-row mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="section-subtitle text-highlight">CONFIRMED RESERVATIONS</span>
                <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Completed Bookings & Tickets</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/trains" className="btn btn-outline-light btn-sm">
                  + Book Train
                </Link>
                <Link to="/packages" className="btn btn-primary btn-sm">
                  + Book Package
                </Link>
              </div>
            </div>

            {allBookings.length === 0 ? (
              <div className="dash-subcard text-center py-5 animate-fade-in" style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)',
                padding: '36px 20px'
              }}>
                <Package size={42} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h4 style={{ color: 'var(--text-main)', marginBottom: '6px' }}>
                  {user ? `No Travel Bookings Yet for ${user.name || user.username}` : 'No Travel Bookings Yet'}
                </h4>
                <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
                  {user 
                    ? 'Your account has no confirmed bookings yet. Explore signature holiday packages or reserve confirmed Indian Railways train tickets with instant PNR generation.'
                    : 'Sign in to view your account bookings or reserve your first holiday package or train ticket.'}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <Link to="/packages" className="btn btn-primary btn-sm">
                    Explore Packages &rarr;
                  </Link>
                  <Link to="/trains" className="btn btn-outline-light btn-sm">
                    Book Train Tickets &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bookings-cards-list">
                {allBookings.map((b) => {
                  const isTrain = b.bookingType === 'TRAIN' || !!b.pnr;
                  return (
                    <div key={b._id} className="booking-record-card animate-fade-in">
                      <div className="record-header">
                        <div className="record-type-pill" style={{
                          background: isTrain ? 'rgba(59, 130, 246, 0.15)' : 'rgba(235, 94, 40, 0.15)',
                          color: isTrain ? '#60a5fa' : 'var(--coral-primary)'
                        }}>
                          {isTrain ? <TrainIcon size={16} /> : <Package size={16} />}
                          <span>{isTrain ? 'INDIAN RAILWAYS' : 'HOLIDAY PACKAGE'}</span>
                        </div>
                        <div className="record-ref-tags">
                          <span className="ref-badge">
                            {isTrain ? 'PNR: ' : 'Ref: '}
                            <strong>{b.pnr || b.referenceNumber || b.bookingId}</strong>
                          </span>
                          <span className="booking-id-tag">ID: {b.bookingId}</span>
                        </div>
                        <span className="badge-confirmed">
                          <CheckCircle size={14} /> CONFIRMED
                        </span>
                      </div>

                      <div className="record-body-grid">
                        <div>
                          <h3 className="record-title">
                            {isTrain
                              ? `${b.trainSnapshot?.trainNumber || ''} ${b.trainSnapshot?.trainName || 'Express Rail'}`
                              : b.packageTitle}
                          </h3>
                          <p className="record-subtitle">
                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {isTrain
                              ? `${b.trainSnapshot?.fromCity || ''} (${b.trainSnapshot?.fromCode || ''}) → ${b.trainSnapshot?.toCity || ''} (${b.trainSnapshot?.toCode || ''}) • Coach: ${b.selectedClass || '3A'}`
                              : `${b.destination} • ${b.duration}`}
                          </p>
                          <div className="record-meta-strip">
                            <span>
                              <Calendar size={14} />
                              {b.journeyDate || b.travelDate
                                ? new Date(b.journeyDate || b.travelDate).toLocaleDateString()
                                : 'Scheduled'}
                            </span>
                            <span>
                              <Users size={14} />
                              {isTrain
                                ? `${b.passengers?.length || 1} Passenger(s)`
                                : `${b.paxCount || 1} Traveler(s)`}
                            </span>
                            {(b.passengers?.[0]?.fullName || b.primaryContact?.fullName) && (
                              <span>Lead: {b.passengers?.[0]?.fullName || b.primaryContact?.fullName}</span>
                            )}
                            {isTrain && (b.passengers?.[0]?.allocatedCoach || b.passengers?.[0]?.allocatedBerth) && (
                              <span style={{ color: '#38bdf8' }}>
                                Coach: {b.passengers[0].allocatedCoach} • Berth: {b.passengers[0].allocatedBerth}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="record-side-col">
                          <div className="fare-box">
                            <span className="fare-lbl">Total Paid</span>
                            <strong className="fare-val text-highlight">₹{(b.totalAmount || 0).toLocaleString('en-IN')} INR</strong>
                          </div>
                          <Link to="/my-bookings" className="btn btn-primary btn-sm">
                            View in My Bookings &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Submitted Travel Enquiries (Full Details) */}
          <div className="mb-4">
            <div className="section-header-row mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="section-subtitle" style={{ color: '#38bdf8' }}>CONCIERGE INQUIRY LOG</span>
                <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Submitted Travel Enquiries (Details)</h2>
              </div>
              <Link to="/#inquiry" className="btn btn-outline-light btn-sm">
                + Submit New Enquiry
              </Link>
            </div>

            {inquiries.length === 0 ? (
              <div className="dash-subcard text-center py-5 animate-fade-in" style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)',
                padding: '36px 20px'
              }}>
                <MessageSquare size={42} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h4 style={{ color: 'var(--text-main)', marginBottom: '6px' }}>
                  {user ? `No Travel Enquiries Logged for ${user.name || user.username}` : 'No Travel Enquiries Logged Yet'}
                </h4>
                <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
                  Have a dream destination in mind? Submit an enquiry on the home page and our concierge team will plan your bespoke itinerary.
                </p>
                <Link to="/" className="btn btn-primary btn-sm">
                  Plan a Custom Journey on Home &rarr;
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '16px'
              }}>
                {inquiries.map((inq) => (
                  <div
                    key={inq._id}
                    className="animate-fade-in"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      {/* Top status & date row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <CheckCircle size={13} /> {inq.status || 'Submitted'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Recent'}
                        </span>
                      </div>

                      {/* Destination Title */}
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} style={{ color: 'var(--coral-primary)' }} />
                        <span>{inq.destination}</span>
                      </h3>

                      {/* Full Inquiry Details Grid */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        marginBottom: '12px',
                        fontSize: '0.86rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Travelers:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{inq.people || 2} Persons</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Departure:</span>
                          <strong style={{ color: 'var(--text-main)' }}>
                            {inq.checkin ? new Date(inq.checkin).toLocaleDateString() : 'Flexible Dates'}
                          </strong>
                        </div>
                        {inq.checkout && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Return:</span>
                            <strong style={{ color: 'var(--text-main)' }}>
                              {new Date(inq.checkout).toLocaleDateString()}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submitter Contact Footer */}
                    <div style={{
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      color: 'var(--text-dim)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Contact: <strong style={{ color: 'var(--text-main)' }}>{inq.userName || 'Traveler'}</strong></span>
                      <span>{inq.userEmail || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Saved Trips & Wishlist */}
          <div className="mb-4">
            <div className="section-header-row mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="section-subtitle" style={{ color: '#ec4899' }}>SAVED FOR LATER</span>
                <h2 className="section-title" style={{ fontSize: '1.4rem' }}>My Saved Trips & Wishlist ({wishlist.length})</h2>
              </div>
              <Link to="/packages" className="btn btn-outline-light btn-sm">
                + Explore More Packages
              </Link>
            </div>

            {wishlist.length === 0 ? (
              <div className="empty-state text-center py-4" style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '32px'
              }}>
                <Heart size={36} color="#ec4899" style={{ opacity: 0.6, margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Your Saved Trips Wishlist is Empty</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 16px' }}>
                  Found a dream vacation package? Click the heart icon on any vacation package to save it to your personal wishlist.
                </p>
                <Link to="/packages" className="btn btn-primary btn-sm">
                  Browse Curated Packages &rarr;
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {wishlist.map((item) => (
                  <div
                    key={item._id}
                    className="animate-fade-in"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ position: 'relative', height: '140px' }}>
                      <img
                        src={item.image || '/images/packege-1.jpg'}
                        alt={item.packageTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFromWishlist(item)}
                        title="Remove from saved wishlist"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 'var(--radius-full)',
                        padding: '3px 10px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#f59e0b',
                        fontWeight: 600
                      }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span>{item.rating || 4.9}</span>
                      </div>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {item.destination} • {item.duration}
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-main)' }}>
                          {item.packageTitle}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Price Per Person</div>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--coral-primary)' }}>
                            ₹{item.price ? item.price.toLocaleString('en-IN') : 'N/A'}
                          </strong>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleBookWishlistItem(item)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span>Reserve Now</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Verified Payment Transactions */}
          {payments.length > 0 && (
            <div className="mb-4">
              <div className="section-header-row mb-3">
                <div>
                  <span className="section-subtitle" style={{ color: '#10b981' }}>FINANCIAL AUDIT TRAIL</span>
                  <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Verified Payment Transactions</h2>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr',
                  padding: '12px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-dim)'
                }}>
                  <span>TRANSACTION ID</span>
                  <span>BOOKING REFERENCE</span>
                  <span>METHOD</span>
                  <span>AMOUNT</span>
                  <span>STATUS</span>
                </div>
                {payments.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr',
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{p.transactionId}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{p.bookingId}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{p.paymentMethod || 'CARD'}</span>
                    <strong style={{ color: 'var(--coral-primary)' }}>₹{p.amount} INR</strong>
                    <span>
                      <span className="badge-confirmed" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {p.status || 'SUCCESS'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Shortcuts */}
          <div className="dash-subcard mb-4" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Direct Travel Portals</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Instant access to live bookings and travel reservations
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              <Link to="/packages" className="quick-action-btn" style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <span>Curated Vacation Packages</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/my-bookings" className="quick-action-btn" style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <span>All Booking E-Tickets</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/flights" className="quick-action-btn" style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <span>Search Live Flights (Google Flights)</span>
                <ExternalLink size={16} />
              </Link>
              <Link to="/trains" className="quick-action-btn" style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                <span>Search Live Trains (IRCTC Gateway)</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
