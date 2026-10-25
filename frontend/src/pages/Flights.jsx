import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CityInput from '../components/CityInput';
import { buildGoogleFlightsUrl, getAirportCode } from '../utils/portalRedirects';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Luggage, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function Flights() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Search filter states
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [cabinClass, setCabinClass] = useState('economy');

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to search and access live flights on Google Flights.', 'info');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const qFrom = searchParams.get('from') || '';
    const qTo = searchParams.get('to') || '';
    if (qFrom && qFrom !== from) setFrom(qFrom);
    if (qTo && qTo !== to) setTo(qTo);
  }, [searchParams]);

  const redirectToGoogleFlights = (origin = from, dest = to) => {
    if (!isAuthenticated) {
      showToast('Please sign in to search live flights.', 'info');
      navigate('/login?redirect=/flights');
      return;
    }
    const fromCode = getAirportCode(origin, 'DEL');
    const toCode = getAirportCode(dest, 'BOM');
    const url = buildGoogleFlightsUrl(origin, dest, departureDate);

    showToast(`✈️ Opening Google Flights with pre-filled airports: ${fromCode} → ${toCode}...`, 'info');
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    redirectToGoogleFlights(from, to);
  };

  const popularFlightRoutes = [
    {
      id: 'flight-route-1',
      title: 'Delhi ↔ Mumbai',
      fromCity: 'Delhi',
      fromCode: 'DEL',
      toCity: 'Mumbai',
      toCode: 'BOM',
      duration: '2h 10m',
      airlines: 'IndiGo, Air India, Vistara, Akasa Air',
      type: 'Domestic Non-Stop',
      badge: 'Busiest Sky Corridor'
    },
    {
      id: 'flight-route-2',
      title: 'Delhi ↔ Dubai',
      fromCity: 'Delhi',
      fromCode: 'DEL',
      toCity: 'Dubai',
      toCode: 'DXB',
      duration: '3h 45m',
      airlines: 'Emirates, Air India, IndiGo, flydubai',
      type: 'International Direct',
      badge: 'Top International'
    },
    {
      id: 'flight-route-3',
      title: 'Mumbai ↔ Singapore',
      fromCity: 'Mumbai',
      fromCode: 'BOM',
      toCity: 'Singapore',
      toCode: 'SIN',
      duration: '5h 20m',
      airlines: 'Singapore Airlines, Air India, Scoot',
      type: 'International Direct',
      badge: 'Global Gateway'
    },
    {
      id: 'flight-route-4',
      title: 'Bangalore ↔ Delhi',
      fromCity: 'Bangalore',
      fromCode: 'BLR',
      toCity: 'Delhi',
      toCode: 'DEL',
      duration: '2h 45m',
      airlines: 'IndiGo, Air India, Vistara',
      type: 'Domestic Non-Stop',
      badge: 'Metro Express'
    },
    {
      id: 'flight-route-5',
      title: 'Mumbai ↔ Goa (MOPA)',
      fromCity: 'Mumbai',
      fromCode: 'BOM',
      toCity: 'Goa',
      toCode: 'GOX',
      duration: '1h 15m',
      airlines: 'IndiGo, Akasa Air, Air India Express',
      type: 'Holiday Express',
      badge: 'Vacation Favorite'
    },
    {
      id: 'flight-route-6',
      title: 'Delhi ↔ London (Heathrow)',
      fromCity: 'Delhi',
      fromCode: 'DEL',
      toCity: 'London',
      toCode: 'LHR',
      duration: '9h 15m',
      airlines: 'British Airways, Virgin Atlantic, Air India',
      type: 'Long Haul Direct',
      badge: 'Premium Transcontinental'
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
    <div className="flights-page container py-4">
      {/* Top Banner */}
      <div className="page-header-banner">
        <div className="header-badge">
          <Plane size={16} /> <span>LIVE GLOBAL FLIGHT RADAR & AIRLINES</span>
        </div>
        <h1>Search & Book Premier Flights</h1>
        <p>
          Compare verified real-time airline schedules, seat maps, multi-cabin fares, and baggage allowances directly on Google Flights with instant airline ticketing.
        </p>
      </div>

      {/* Main Search Filter Bar */}
      <div className="search-filter-box mb-4">
        <form onSubmit={handleSearchSubmit} className="search-row-grid">
          <div className="form-group">
            <label>From City / Airport (IATA Code)</label>
            <CityInput
              placeholder="e.g. Delhi (DEL)"
              value={from}
              onChange={setFrom}
              mode="flight"
              icon={Plane}
              required
            />
          </div>
          <div className="form-group">
            <label>To Destination (IATA Code)</label>
            <CityInput
              placeholder="e.g. Dubai (DXB)"
              value={to}
              onChange={setTo}
              mode="flight"
              icon={Plane}
              required
            />
          </div>
          <div className="form-group">
            <label>Departure Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            />
          </div>
          <div className="form-group">
            <label>Cabin Class</label>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business Class</option>
              <option value="first">First Class</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-search-flights" style={{ height: '48px' }}>
            <Search size={18} /> <span>Search on Google Flights ↗</span>
          </button>
        </form>
      </div>

      {/* Live Google Flights Gateway Strip */}
      <div className="irctc-official-strip mb-4 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(255, 94, 98, 0.12) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
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
            background: '#38bdf8',
            color: '#000',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            ✈️
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Real-Time Global Flight Integration via Google Flights
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Live airline pricing in ₹ • Direct airline seat selection • Zero hidden booking surcharges
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => redirectToGoogleFlights()}
          className="btn btn-primary btn-sm"
          style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 700 }}
        >
          Open Google Flights Radar ↗
        </button>
      </div>

      {/* Popular Flight Corridors Grid */}
      <div className="mb-4">
        <div className="section-header-row mb-3">
          <div>
            <span className="section-subtitle" style={{ color: '#38bdf8' }}>POPULAR AIR ROUTES</span>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Top Domestic & International Corridors</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Airport IATA Codes: DEL, BOM, BLR, DXB, SIN, LHR, GOX
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {popularFlightRoutes.map((r) => (
            <div
              key={r.id}
              className="flight-card-card animate-fade-in"
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
                  <span className="badge-days" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
                    {r.badge}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {r.duration}
                  </span>
                </div>

                {/* Cities & Airport Codes Row */}
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
                    <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--text-main)' }}>{r.fromCode}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.fromCity}</span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 10px' }}>
                    <Plane size={18} style={{ color: '#38bdf8' }} />
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {r.type}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--text-main)' }}>{r.toCode}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.toCity}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Major Carriers:</strong> {r.airlines}
                </div>
              </div>

              <button
                type="button"
                onClick={() => redirectToGoogleFlights(r.fromCity + ` (${r.fromCode})`, r.toCity + ` (${r.toCode})`)}
                className="btn btn-primary w-100"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #ff5e62 100%)',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Search Flights on Google Flights ↗
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Flight Trust & Guarantee Row */}
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
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Direct Airline Pricing</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            View live fares directly from airlines including IndiGo, Air India, Emirates, and Singapore Airlines in Rupees (₹).
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <Luggage size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Baggage Transparency</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Transparent baggage allowances with 7 kg cabin and 15–30 kg checked luggage rules clearly displayed.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
            <Zap size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Instant PNR Issuance</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Direct booking on airline websites ensures immediate e-ticket delivery and frequent flyer mileage accumulation.
          </p>
        </div>
      </div>
    </div>
  );
}
