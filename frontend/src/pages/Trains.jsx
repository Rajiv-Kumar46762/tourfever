import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CityInput from '../components/CityInput';
import { api } from '../services/api';
import { buildTrainPortalUrl, getStationCode, getOfficialIRCTCUrl, getCleanCity } from '../utils/portalRedirects';
import { 
  Train as TrainIcon, 
  Clock, 
  MapPin, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Zap, 
  Ticket, 
  UtensilsCrossed, 
  Info, 
  Calendar, 
  Users, 
  Check 
} from 'lucide-react';

export default function Trains() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Search filter states
  const [from, setFrom] = useState(searchParams.get('from') || 'New Delhi (NDLS)');
  const [to, setTo] = useState(searchParams.get('to') || 'Mumbai Central (MMCT)');
  const [journeyDate, setJourneyDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [coachClass, setCoachClass] = useState('ALL');

  // Live Train Results State
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to search and access live train schedules & IRCTC booking.', 'info');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const qFrom = searchParams.get('from') || '';
    const qTo = searchParams.get('to') || '';
    if (qFrom && qFrom !== from) setFrom(qFrom);
    if (qTo && qTo !== to) setTo(qTo);
  }, [searchParams]);

  const performTrainSearch = async (originStr = from, destStr = to) => {
    if (!originStr || !destStr) {
      showToast('Please specify both Origin and Destination railway stations.', 'info');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const cleanFrom = getCleanCity(originStr, 'Delhi');
      const cleanTo = getCleanCity(destStr, 'Mumbai');
      const res = await api.getTrains({ from: cleanFrom, to: cleanTo, date: journeyDate });
      if (res && res.data) {
        setTrains(res.data);
        if (res.data.length > 0) {
          showToast(`🚆 Found ${res.data.length} Indian Railways train(s) for ${cleanFrom} → ${cleanTo}!`, 'success');
        } else {
          showToast('No direct trains found for this route. You can check official IRCTC portal directly.', 'info');
        }
      }
    } catch (err) {
      console.error('Error fetching trains:', err);
      showToast('Failed to load train schedules. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    openDirectIRCTC();
  };

  const handleBookTrainTicket = (train, classObj) => {
    if (!isAuthenticated) {
      showToast('Please sign in to book your train ticket.', 'info');
      navigate('/login?redirect=/payment');
      return;
    }
    const checkoutPayload = {
      type: 'train',
      item: train,
      selectedClass: classObj.classCode,
      totalPrice: classObj.fare,
      formData: {
        name: user?.name || user?.username || 'Valued Traveler',
        email: user?.email || 'traveler@tourfever.com',
        phone: user?.phone || '+91 9876543210',
        age: '28',
        gender: 'Male',
        travelDate: journeyDate,
        berthPreference: 'No Preference',
      },
      bookingTime: new Date().toISOString(),
    };
    sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutPayload));
    showToast(`🚆 Reserving ${train.trainName} (${classObj.classCode}). Please enter passenger ticket details...`, 'info');
    navigate('/payment');
  };

  const openDirectIRCTC = () => {
    const url = getOfficialIRCTCUrl();
    showToast('🚆 Opening Official IRCTC Portal (irctc.co.in)...', 'info');
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  };

  // Popular Indian Railway corridors with official Railway Station Codes (NOT airport codes)
  const popularRailCorridors = [
    {
      id: 'corridor-1',
      title: 'New Delhi ↔ Mumbai Central',
      fromStation: 'New Delhi (NDLS)',
      fromCode: 'NDLS',
      toStation: 'Mumbai Central (MMCT)',
      toCode: 'MMCT',
      duration: '15h 32m',
      popularTrains: 'Mumbai Tejas Rajdhani, August Kranti Express, Golden Temple Mail',
      badge: 'Busiest Corridor'
    },
    {
      id: 'corridor-2',
      title: 'New Delhi ↔ Varanasi Jn',
      fromStation: 'New Delhi (NDLS)',
      fromCode: 'NDLS',
      toStation: 'Varanasi Jn (BSB)',
      toCode: 'BSB',
      duration: '8h 00m',
      popularTrains: 'Vande Bharat Express (22436), Kashi Vishwanath Express',
      badge: 'Vande Bharat Route'
    },
    {
      id: 'corridor-3',
      title: 'Howrah Jn (Kolkata) ↔ New Delhi',
      fromStation: 'Howrah Jn (HWH)',
      fromCode: 'HWH',
      toStation: 'New Delhi (NDLS)',
      toCode: 'NDLS',
      duration: '17h 05m',
      popularTrains: 'Howrah Rajdhani Express, Poorva Express',
      badge: 'Grand Trunk'
    },
    {
      id: 'corridor-4',
      title: 'KSR Bengaluru ↔ Chennai Central',
      fromStation: 'KSR Bengaluru (SBC)',
      fromCode: 'SBC',
      toStation: 'Chennai Central (MAS)',
      toCode: 'MAS',
      duration: '4h 25m',
      popularTrains: 'MGR Chennai Vande Bharat, Shatabdi Express',
      badge: 'Express Corridor'
    },
    {
      id: 'corridor-5',
      title: 'CSMT Mumbai ↔ Madgaon Jn (Goa)',
      fromStation: 'CSMT Mumbai (CSMT)',
      fromCode: 'CSMT',
      toStation: 'Madgaon Jn (MAO)',
      toCode: 'MAO',
      duration: '7h 45m',
      popularTrains: 'Goa Vande Bharat Express, Tejas Express',
      badge: 'Scenic Holiday'
    },
    {
      id: 'corridor-6',
      title: 'New Delhi ↔ Jaipur Jn',
      fromStation: 'New Delhi (NDLS)',
      fromCode: 'NDLS',
      toStation: 'Jaipur Jn (JP)',
      toCode: 'JP',
      duration: '3h 50m',
      popularTrains: 'Ajmer Shatabdi Express, Jaipur Vande Bharat',
      badge: 'Golden Triangle'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner mb-3"></div>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="trains-page container py-4">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="header-badge">
          <TrainIcon size={16} /> <span>INDIAN RAILWAYS RESERVATIONS & TICKET BOOKING</span>
        </div>
        <h1>Search & Book Train Tickets</h1>
        <p>
          Search real-time express trains, select coach classes with live seat availability, enter passenger ticket details, and receive confirmed PNRs.
        </p>
      </div>

      {/* Train Search Filter Bar */}
      <div className="search-filter-box mb-4">
        <form onSubmit={handleSearchSubmit} className="search-row-grid">
          <div className="form-group">
            <label>Origin Railway Station (Code)</label>
            <CityInput
              placeholder="e.g. New Delhi (NDLS)"
              value={from}
              onChange={setFrom}
              mode="train"
              icon={TrainIcon}
              required
            />
          </div>
          <div className="form-group">
            <label>Destination Railway Station (Code)</label>
            <CityInput
              placeholder="e.g. Mumbai Central (MMCT)"
              value={to}
              onChange={setTo}
              mode="train"
              icon={TrainIcon}
              required
            />
          </div>
          <div className="form-group">
            <label>Journey Date</label>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            />
          </div>
          <div className="form-group">
            <label>Coach Category</label>
            <select
              value={coachClass}
              onChange={(e) => setCoachClass(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            >
              <option value="ALL">All Classes (1A, 2A, 3A, CC, SL)</option>
              <option value="1A">AC First Class (1A)</option>
              <option value="2A">AC 2 Tier (2A)</option>
              <option value="3A">AC 3 Tier (3A)</option>
              <option value="EC">Executive Anubhuti / Chair Car (EC)</option>
              <option value="CC">AC Chair Car (CC)</option>
              <option value="SL">Sleeper Class (SL)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', gridColumn: 'span 1' }}>
            <button type="submit" className="btn btn-primary btn-search-flights" style={{ height: '48px', flex: 1 }}>
              <Search size={18} /> <span>Search Trains on IRCTC ➔</span>
            </button>
            <button
              type="button"
              onClick={() => openDirectIRCTC(from, to)}
              className="btn btn-outline-light"
              style={{ height: '48px', padding: '0 14px' }}
              title="Open Official IRCTC Website (irctc.co.in)"
            >
              <ExternalLink size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Official IRCTC Gateway Strip */}
      <div className="irctc-official-strip mb-4 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(255, 94, 98, 0.12) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: '#f59e0b',
            color: '#000',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            IR
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Indian Railway Catering & Tourism Corporation (IRCTC) Direct Gateway
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Book directly on Tour Fever with instant PNR generation, or jump to the official IRCTC portal (irctc.co.in).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openDirectIRCTC}
          className="btn btn-primary btn-sm"
          style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
        >
          Open Official IRCTC Portal (irctc.co.in) ↗
        </button>
      </div>

      {/* Search Results Section */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner mb-3"></div>
          <p style={{ color: 'var(--text-muted)' }}>Searching live Indian Railways train schedules and PRS seat availability...</p>
        </div>
      )}

      {hasSearched && !loading && trains.length > 0 && (
        <div className="mb-4">
          <div className="section-header-row mb-3">
            <div>
              <span className="section-subtitle" style={{ color: '#f59e0b' }}>AVAILABLE TRAINS ({trains.length})</span>
              <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
                Express & Superfast Trains for {getCleanCity(from, 'Delhi')} ➔ {getCleanCity(to, 'Mumbai')}
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Travel Date: <strong>{new Date(journeyDate).toLocaleDateString()}</strong>
            </span>
          </div>

          <div className="trains-results-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {trains.map((train) => (
              <div
                key={train._id || train.trainNumber}
                className="booking-record-card animate-fade-in"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px'
                }}
              >
                {/* Train Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      #{train.trainNumber}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{train.trainName}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Runs: <strong>{train.runningDays?.join(', ') || 'Daily'}</strong>
                    </span>
                    {train.pantryAvailable && (
                      <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem' }}>
                        <UtensilsCrossed size={12} /> Pantry Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Train Schedule Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  marginBottom: '18px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <strong style={{ fontSize: '1.3rem', display: 'block', color: 'var(--text-main)' }}>
                      {train.departureTime}
                    </strong>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {train.fromStation} ({train.fromCode})
                    </span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Origin Departure
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f59e0b' }}>
                      <Clock size={14} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{train.duration}</span>
                    </div>
                    <div style={{
                      width: '120px',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                      margin: '6px auto'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Direct Superfast</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.3rem', display: 'block', color: 'var(--text-main)' }}>
                      {train.arrivalTime}
                    </strong>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {train.toStation} ({train.toCode})
                    </span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Destination Arrival
                    </span>
                  </div>
                </div>

                {/* Available Classes & Ticket Details Booking Grid */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                    SELECT CLASS & PROCEED TO PASSENGER TICKET DETAILS:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px'
                  }}>
                    {train.classes?.map((c) => (
                      <div
                        key={c.classCode}
                        style={{
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{c.classCode}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                              {c.statusText || 'AVAILABLE'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                            {c.className}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--coral-primary)', marginBottom: '8px' }}>
                            ₹{c.fare} <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>INR</small>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBookTrainTicket(train, c)}
                            className="btn btn-primary w-100 btn-sm"
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                              fontWeight: 700
                            }}
                          >
                            Book {c.classCode} ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !loading && trains.length === 0 && (
        <div className="dash-subcard text-center py-5 mb-4" style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 20px'
        }}>
          <TrainIcon size={42} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h4 style={{ color: 'var(--text-main)', marginBottom: '6px' }}>No Scheduled Trains Found on this Route</h4>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            We could not find direct trains between {from} and {to} for the selected date. You can check the official IRCTC portal directly.
          </p>
          <button
            type="button"
            onClick={() => openDirectIRCTC(from, to)}
            className="btn btn-primary btn-sm"
            style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 700 }}
          >
            Check Official IRCTC Portal ↗
          </button>
        </div>
      )}

      {/* Popular Railway Corridors Grid */}
      <div className="mb-4">
        <div className="section-header-row mb-3">
          <div>
            <span className="section-subtitle" style={{ color: '#f59e0b' }}>POPULAR RAILWAY CORRIDORS</span>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Premier Express & Vande Bharat Routes</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Official Railway Station Codes: NDLS, MMCT, CSMT, BSB, HWH, SBC, MAS
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {popularRailCorridors.map((c) => (
            <div
              key={c.id}
              className="train-card-card animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-days" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }}>
                    {c.badge}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {c.duration}
                  </span>
                </div>

                {/* Stations & Railway Codes Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '14px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--text-main)' }}>{c.fromCode}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.fromStation}</span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 10px' }}>
                    <TrainIcon size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Railway Route
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--text-main)' }}>{c.toCode}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.toStation}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Major Trains:</strong> {c.popularTrains}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={openDirectIRCTC}
                  className="btn btn-primary btn-sm"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    fontWeight: 700
                  }}
                >
                  Book on Official IRCTC ➔
                </button>
                <button
                  type="button"
                  onClick={openDirectIRCTC}
                  className="btn btn-outline-light btn-sm"
                  title="Open Official IRCTC Website"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official IRCTC Key Passenger Information Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
            <CheckCircle2 size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Indian Railways Station Codes</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Search exclusively with official Railway Station Codes (NDLS, MMCT, CSMT, BSB, HWH, SBC) for accurate train routing.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
            <Sparkles size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Instant 10-Digit PNR</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Direct reservation records official 10-digit Indian Railways PNR numbers with automated coach and berth assignments.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <ShieldCheck size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>E-Ticket & Berth Tracking</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            All confirmed train reservations are logged directly in your dashboard and available for instant download in My Bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
