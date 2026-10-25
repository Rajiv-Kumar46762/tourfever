import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CityInput from '../components/CityInput';
import { buildBookingComUrl, getCleanCity } from '../utils/portalRedirects';
import { 
  Hotel as HotelIcon, 
  MapPin, 
  Star, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  BedDouble, 
  Users,
  Compass
} from 'lucide-react';

export default function Hotels() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [guests, setGuests] = useState('2');
  const [checkinDate, setCheckinDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [checkoutDate, setCheckoutDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to search and access live hotel rates on Booking.com.', 'info');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const qCity = searchParams.get('city') || '';
    if (qCity && qCity !== city) setCity(qCity);
  }, [searchParams]);

  const redirectToBooking = (destCity = city) => {
    if (!isAuthenticated) {
      showToast('Please sign in to book hotel rooms.', 'info');
      navigate('/login?redirect=/hotels');
      return;
    }
    const targetCity = destCity || city || 'Goa';
    const cleanCity = getCleanCity(targetCity, 'Goa');
    const url = buildBookingComUrl(targetCity, checkinDate, checkoutDate, guests);

    showToast(`🏨 Opening Booking.com with pre-filled destination: ${cleanCity}...`, 'info');
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    redirectToBooking(city);
  };

  const popularHotelDestinations = [
    {
      id: 'dest-1',
      title: 'Goa Coastal Resorts & Villas',
      city: 'Goa',
      location: 'North & South Goa, India',
      vibe: 'Beachfront & Luxury Heritage',
      rating: 4.8,
      reviews: '12,000+ Verified Reviews',
      badge: 'Holiday Bestseller'
    },
    {
      id: 'dest-2',
      title: 'Dubai Marina & Palm Suites',
      city: 'Dubai',
      location: 'Downtown & Palm Jumeirah, UAE',
      vibe: 'Ultra-Luxury & Skyline Views',
      rating: 4.9,
      reviews: '28,000+ Verified Reviews',
      badge: 'Top International'
    },
    {
      id: 'dest-3',
      title: 'Maldives Overwater Lagoon Villas',
      city: 'Maldives',
      location: 'Male & Private Atolls',
      vibe: 'Private Ocean Villas with Pool',
      rating: 4.95,
      reviews: '8,500+ Verified Reviews',
      badge: 'Signature Luxury'
    },
    {
      id: 'dest-4',
      title: 'Jaipur Royal Palaces & Haveli Stays',
      city: 'Jaipur',
      location: 'Pink City & Amber, Rajasthan',
      vibe: 'Royal Heritage & Courtyards',
      rating: 4.75,
      reviews: '9,400+ Verified Reviews',
      badge: 'Cultural Heritage'
    },
    {
      id: 'dest-5',
      title: 'Swiss Alps Mountain Chalets',
      city: 'Swiss Alps',
      location: 'Zermatt, Interlaken & Zurich',
      vibe: 'Glacier Views & Spa Retreats',
      rating: 4.9,
      reviews: '6,200+ Verified Reviews',
      badge: 'Alpine Escapes'
    },
    {
      id: 'dest-6',
      title: 'Manali & Shimla Pine Mountain Lodges',
      city: 'Manali',
      location: 'Solang Valley, Himachal Pradesh',
      vibe: 'Snow Peaks & Riverside Cottages',
      rating: 4.7,
      reviews: '7,800+ Verified Reviews',
      badge: 'Mountain Serenity'
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
    <div className="hotels-page container py-4">
      {/* Header */}
      <div className="page-header-banner">
        <div className="header-badge">
          <HotelIcon size={16} /> <span>LIVE HOTEL VACANCIES VIA BOOKING.COM</span>
        </div>
        <h1>Search & Book Luxury Hotels</h1>
        <p>
          Discover verified oceanfront villas, 5-star mountain chalets, and urban suites with live pricing in Rupees (₹) and free cancellation options.
        </p>
      </div>

      {/* Hotel Search Filter Bar */}
      <div className="search-filter-box mb-4">
        <form onSubmit={handleSearchSubmit} className="search-row-grid">
          <div className="form-group">
            <label>City or Destination</label>
            <CityInput
              placeholder="e.g. Dubai, Goa, Maldives"
              value={city}
              onChange={setCity}
              mode="city"
              icon={HotelIcon}
              required
            />
          </div>
          <div className="form-group">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkinDate}
              onChange={(e) => setCheckinDate(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            />
          </div>
          <div className="form-group">
            <label>Check-out Date</label>
            <input
              type="date"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            />
          </div>
          <div className="form-group">
            <label>Guests & Rooms</label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            >
              <option value="1">1 Adult (1 Room)</option>
              <option value="2">2 Adults (1 Room)</option>
              <option value="3">3 Adults (1 Room)</option>
              <option value="4">4 Adults (2 Rooms)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-search-flights" style={{ height: '48px' }}>
            <Search size={18} /> <span>Search on Booking.com ↗</span>
          </button>
        </form>
      </div>

      {/* Booking.com Gateway Strip */}
      <div className="irctc-official-strip mb-4 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.12) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
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
            background: '#10b981',
            color: '#fff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            🏨
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Direct Booking.com Portal Integration
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time room availability • Verified traveler reviews • Flexible pay-at-property options
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => redirectToBooking()}
          className="btn btn-primary btn-sm"
          style={{ background: '#10b981', color: '#fff', fontWeight: 700 }}
        >
          Open Booking.com Portal ↗
        </button>
      </div>

      {/* Popular Hotel Destinations Grid */}
      <div className="mb-4">
        <div className="section-header-row mb-3">
          <div>
            <span className="section-subtitle" style={{ color: '#10b981' }}>FEATURED DESTINATIONS</span>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Top Resort & Boutique Hotel Escapes</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time pricing in ₹ • Direct booking confirmation
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {popularHotelDestinations.map((d) => (
            <div
              key={d.id}
              className="hotel-card-card animate-fade-in"
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
                  <span className="badge-days" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                    {d.badge}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <strong>{d.rating}</strong>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '6px' }}>{d.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                  <MapPin size={14} /> {d.location}
                </p>

                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '14px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{d.vibe}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '2px' }}>{d.reviews}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => redirectToBooking(d.city)}
                className="btn btn-primary w-100"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Search Hotels on Booking.com ↗
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hotel Trust & Assurance Strip */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
            <CheckCircle2 size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Best Price Guarantee</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Compare hotel rates with transparent pricing in Rupees (₹), taxes included, and zero surprise fees.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <Sparkles size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Free Cancellation</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enjoy risk-free flexible room bookings with free cancellation on thousands of selected properties.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
            <ShieldCheck size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Instant Confirmation</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Immediate voucher generation sent directly to your email with direct hotel front desk registration.
          </p>
        </div>
      </div>
    </div>
  );
}
