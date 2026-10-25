import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CityInput from '../components/CityInput';
import { buildRedBusUrl, getCleanCity } from '../utils/portalRedirects';
import { 
  Bus as BusIcon, 
  MapPin, 
  Clock, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Armchair
} from 'lucide-react';

export default function Buses() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [travelDate, setTravelDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [coachType, setCoachType] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to search and access live bus services on RedBus.', 'info');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const qFrom = searchParams.get('from') || '';
    const qTo = searchParams.get('to') || '';
    if (qFrom && qFrom !== from) setFrom(qFrom);
    if (qTo && qTo !== to) setTo(qTo);
  }, [searchParams]);

  const redirectToRedBus = (origin = from, dest = to) => {
    if (!isAuthenticated) {
      showToast('Please sign in to book bus tickets.', 'info');
      navigate('/login?redirect=/buses');
      return;
    }
    const fromCity = getCleanCity(origin || from, 'Bangalore');
    const toCity = getCleanCity(dest || to, 'Goa');
    const url = buildRedBusUrl(origin || from, dest || to);

    showToast(`🚌 Opening RedBus with pre-filled route: ${fromCity} → ${toCity}...`, 'info');
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    redirectToRedBus(from, to);
  };

  const popularBusRoutes = [
    {
      id: 'bus-route-1',
      title: 'Bangalore ↔ Goa',
      fromCity: 'Bangalore',
      toCity: 'Goa',
      duration: '11h 30m',
      operators: 'KSRTC Airavat Club Class, VRL Travels, SRS Travels',
      type: 'Multi-Axle AC Sleeper',
      badge: 'Popular Holiday Route'
    },
    {
      id: 'bus-route-2',
      title: 'Delhi ↔ Jaipur',
      fromCity: 'Delhi',
      toCity: 'Jaipur',
      duration: '4h 45m',
      operators: 'RSRTC Volvo, Zingbus, IntrCity SmartBus',
      type: 'Express AC Seater',
      badge: 'Frequent Daily Buses'
    },
    {
      id: 'bus-route-3',
      title: 'Mumbai ↔ Pune',
      fromCity: 'Mumbai',
      toCity: 'Pune',
      duration: '3h 15m',
      operators: 'MSRTC Shivneri, Neeta Travels, Purple Travels',
      type: 'Expressway Volvo',
      badge: 'Busiest Corridor'
    },
    {
      id: 'bus-route-4',
      title: 'Delhi ↔ Manali',
      fromCity: 'Delhi',
      toCity: 'Manali',
      duration: '12h 45m',
      operators: 'HRTC Himsuta Volvo, Zingbus, City Land Travels',
      type: 'Luxury Alpine Sleeper',
      badge: 'Scenic Mountain Trail'
    },
    {
      id: 'bus-route-5',
      title: 'Hyderabad ↔ Bangalore',
      fromCity: 'Hyderabad',
      toCity: 'Bangalore',
      duration: '8h 30m',
      operators: 'TSRTC Garuda Plus, Orange Tours, Jabbar Travels',
      type: 'Overnight Multi-Axle',
      badge: 'Overnight Express'
    },
    {
      id: 'bus-route-6',
      title: 'Bangalore ↔ Chennai',
      fromCity: 'Bangalore',
      toCity: 'Chennai',
      duration: '6h 00m',
      operators: 'SETC, Asian Xpress, Parveen Travels',
      type: 'AC Semi-Sleeper',
      badge: 'Daily Commute'
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
    <div className="buses-page container py-4">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="header-badge">
          <BusIcon size={16} /> <span>LIVE INTERCITY BUS FLEET VIA REDBUS</span>
        </div>
        <h1>Search & Book Executive Sleeper Buses</h1>
        <p>
          Compare verified Volvo Multi-Axle, Mercedes Benz cruisers, and Bharat Benz sleeper coaches directly on RedBus with interactive live seat diagrams.
        </p>
      </div>

      {/* Main Search Filter Bar */}
      <div className="search-filter-box mb-4">
        <form onSubmit={handleSearchSubmit} className="search-row-grid">
          <div className="form-group">
            <label>From City / Boarding Point</label>
            <CityInput
              placeholder="e.g. Bangalore"
              value={from}
              onChange={setFrom}
              mode="city"
              icon={BusIcon}
              required
            />
          </div>
          <div className="form-group">
            <label>To Destination / Dropping Point</label>
            <CityInput
              placeholder="e.g. Goa"
              value={to}
              onChange={setTo}
              mode="city"
              icon={BusIcon}
              required
            />
          </div>
          <div className="form-group">
            <label>Journey Date</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            />
          </div>
          <div className="form-group">
            <label>Coach Category</label>
            <select
              value={coachType}
              onChange={(e) => setCoachType(e.target.value)}
              className="form-control"
              style={{ height: '48px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="volvo">Volvo Multi-Axle A/C</option>
              <option value="sleeper">Luxury Sleeper (2+1)</option>
              <option value="benz">Mercedes Benz Cruiser</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-search-flights" style={{ height: '48px' }}>
            <Search size={18} /> <span>Search on RedBus ↗</span>
          </button>
        </form>
      </div>

      {/* RedBus Direct Gateway Strip */}
      <div className="irctc-official-strip mb-4 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
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
            background: '#ef4444',
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
            🚌
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Direct RedBus Fleet & Seat Selection Portal
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Live upper/lower berth layouts • GPS bus tracking • Over 3,500 verified bus operators
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => redirectToRedBus()}
          className="btn btn-primary btn-sm"
          style={{ background: '#ef4444', color: '#fff', fontWeight: 700 }}
        >
          Open RedBus Booking Portal ↗
        </button>
      </div>

      {/* Popular Bus Routes Grid */}
      <div className="mb-4">
        <div className="section-header-row mb-3">
          <div>
            <span className="section-subtitle" style={{ color: '#ef4444' }}>POPULAR BUS ROUTES</span>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Top Interstate & Luxury Sleeper Corridors</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Direct interactive seat layouts via RedBus
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {popularBusRoutes.map((r) => (
            <div
              key={r.id}
              className="bus-card-card animate-fade-in"
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
                  <span className="badge-days" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600 }}>
                    {r.badge}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {r.duration}
                  </span>
                </div>

                {/* Cities Row */}
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
                    <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--text-main)' }}>{r.fromCity}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Boarding Point</span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 10px' }}>
                    <BusIcon size={18} style={{ color: '#ef4444' }} />
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {r.type}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--text-main)' }}>{r.toCity}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dropping Point</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Top Operators:</strong> {r.operators}
                </div>
              </div>

              <button
                type="button"
                onClick={() => redirectToRedBus(r.fromCity, r.toCity)}
                className="btn btn-primary w-100"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Book Seats on RedBus ↗
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bus Trust Row */}
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
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Live GPS Tracking</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track real-time bus locations and accurate boarding point arrival times directly on your smartphone.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
            <Armchair size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Interactive Seat Selection</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Choose window seats, aisle berths, single ladies' seats, and lower sleeper berths with immediate seat lock.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <Zap size={20} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Instant M-Ticket</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Paperless digital boarding pass delivered to WhatsApp and SMS with driver and conductor contact details.
          </p>
        </div>
      </div>
    </div>
  );
}
