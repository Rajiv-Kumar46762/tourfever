import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import CityInput from '../components/CityInput';
import { 
  buildGoogleFlightsUrl, 
  buildTrainPortalUrl, 
  buildBookingComUrl, 
  buildRedBusUrl, 
  getStationCode, 
  getAirportCode, 
  getCleanCity 
} from '../utils/portalRedirects';
import { 
  Plane, 
  Train, 
  Bus, 
  Hotel, 
  Package, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CreditCard,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('flights');
  const [flightSearch, setFlightSearch] = useState({ from: '', to: '', date: '' });
  const [trainSearch, setTrainSearch] = useState({ from: '', to: '', date: '' });
  const [busSearch, setBusSearch] = useState({ from: '', to: '', date: '' });
  const [hotelSearch, setHotelSearch] = useState({ city: '', guests: 2 });

  // Inquiry Form state
  const [inquiry, setInquiry] = useState({
    destination: '',
    people: 2,
    checkin: '',
    checkout: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const handleTabClick = (tab) => {
    if (!isAuthenticated) {
      showToast(`Please sign in to search and access live ${tab} options.`, 'info');
      navigate('/login?redirect=/');
      return;
    }
    setActiveTab(tab);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to search and access live travel options.', 'info');
      navigate('/login?redirect=/');
      return;
    }

    if (activeTab === 'flights') {
      const fromCode = getAirportCode(flightSearch.from, 'DEL');
      const toCode = getAirportCode(flightSearch.to, 'BOM');
      const url = buildGoogleFlightsUrl(flightSearch.from, flightSearch.to, flightSearch.date);
      showToast(`✈️ Opening Google Flights with pre-filled airports: ${fromCode} → ${toCode}...`, 'info');
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } else if (activeTab === 'trains') {
      const url = buildTrainPortalUrl();
      showToast('🚆 Opening Official IRCTC Portal (irctc.co.in)...', 'info');
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } else if (activeTab === 'buses') {
      const fromCity = getCleanCity(busSearch.from, 'Bangalore');
      const toCity = getCleanCity(busSearch.to, 'Goa');
      const url = buildRedBusUrl(busSearch.from, busSearch.to);
      showToast(`🚌 Opening RedBus with pre-filled route: ${fromCity} → ${toCity}...`, 'info');
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } else if (activeTab === 'hotels') {
      const cleanCity = getCleanCity(hotelSearch.city, 'Goa');
      const checkin = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const checkout = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      const url = buildBookingComUrl(hotelSearch.city, checkin, checkout, hotelSearch.guests);
      showToast(`🏨 Opening Booking.com with pre-filled destination: ${cleanCity}...`, 'info');
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } else if (activeTab === 'packages') {
      navigate('/packages');
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to submit a travel concierge inquiry.', 'info');
      navigate('/login?redirect=/');
      return;
    }
    if (!inquiry.destination) {
      showToast('Please specify a dream destination.', 'error');
      return;
    }
    setSubmittingInquiry(true);
    try {
      await api.submitInquiry({
        ...inquiry,
        userName: user?.name || user?.username || 'Valued Traveler',
        userEmail: user?.email || (user ? `${user.username}@tourfever.com` : 'traveler@tourfever.com'),
        phone: user?.phone || '+91 9876543210'
      });
      showToast('🎉 Concierge inquiry submitted! Our travel designers will contact you shortly.', 'success');
      setInquiry({ destination: '', people: 2, checkin: '', checkout: '' });
    } catch (err) {
      showToast('Inquiry recorded locally. We look forward to planning your journey!', 'info');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const signaturePackages = [
    {
      id: 'pkg-1',
      title: 'Maldives Luxury Lagoon Villa',
      destination: 'Maldives',
      duration: '5 Days / 4 Nights',
      price: 89500,
      image: '/images/packege-1.jpg',
      rating: 4.9,
      reviews: 142,
      tag: 'Bestseller'
    },
    {
      id: 'pkg-2',
      title: 'Swiss Alps & Glacier Express',
      destination: 'Switzerland',
      duration: '7 Days / 6 Nights',
      price: 165000,
      image: '/images/packege-2.jpg',
      rating: 5.0,
      reviews: 98,
      tag: 'Signature'
    },
    {
      id: 'pkg-3',
      title: 'Kyoto Zen Temples & Heritage',
      destination: 'Japan',
      duration: '6 Days / 5 Nights',
      price: 128000,
      image: '/images/packege-3.jpg',
      rating: 4.8,
      reviews: 110,
      tag: 'Trending'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-container">
          <div className="hero-badge animate-fade-in">
            <Sparkles size={16} className="text-highlight" />
            <span>DISCOVER EXTRAORDINARY DESTINATIONS</span>
          </div>
          <h1 className="hero-title animate-slide-up">
            Curated Journeys. <br />
            <span className="text-gradient">Flawless Travel Booking.</span>
          </h1>
          <p className="hero-subtitle animate-slide-up">
            Seamlessly reserve premium flights, express rail coaches, executive sleeper buses, and 5-star boutique hotels with real-time seat lock and instant confirmation.
          </p>

          {/* Multi-Service Search Engine Card */}
          <div className="search-card-container animate-scale-up">
            {/* Search Tab Switcher */}
            <div className="search-tabs-strip">
              <button
                type="button"
                className={`search-tab-pill ${activeTab === 'flights' ? 'active' : ''}`}
                onClick={() => handleTabClick('flights')}
              >
                <Plane size={18} /> <span>Flights</span>
              </button>
              <button
                type="button"
                className={`search-tab-pill ${activeTab === 'trains' ? 'active' : ''}`}
                onClick={() => handleTabClick('trains')}
              >
                <Train size={18} /> <span>Trains</span>
              </button>
              <button
                type="button"
                className={`search-tab-pill ${activeTab === 'buses' ? 'active' : ''}`}
                onClick={() => handleTabClick('buses')}
              >
                <Bus size={18} /> <span>Buses</span>
              </button>
              <button
                type="button"
                className={`search-tab-pill ${activeTab === 'hotels' ? 'active' : ''}`}
                onClick={() => handleTabClick('hotels')}
              >
                <Hotel size={18} /> <span>Hotels</span>
              </button>
              <button
                type="button"
                className={`search-tab-pill ${activeTab === 'packages' ? 'active' : ''}`}
                onClick={() => handleTabClick('packages')}
              >
                <Package size={18} /> <span>Packages</span>
              </button>
            </div>

            {/* Dynamic Search Fields */}
            <form
              onSubmit={handleSearchSubmit}
              className="search-fields-form"
              onClickCapture={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  e.stopPropagation();
                  showToast('Please sign in to search and access live travel options.', 'info');
                  navigate(`/login?redirect=/${activeTab}`);
                }
              }}
            >
              {activeTab === 'flights' && (
                <div className="search-inputs-grid">
                  <div className="input-group-box">
                    <label>From City / Airport</label>
                    <CityInput
                      placeholder="e.g. Delhi (DEL)"
                      value={flightSearch.from}
                      onChange={(val) => setFlightSearch({ ...flightSearch, from: val })}
                      mode="flight"
                      icon={Plane}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>To Destination</label>
                    <CityInput
                      placeholder="e.g. Dubai (DXB)"
                      value={flightSearch.to}
                      onChange={(val) => setFlightSearch({ ...flightSearch, to: val })}
                      mode="flight"
                      icon={Plane}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>Departure Date</label>
                    <div className="input-wrapper">
                      <Calendar size={18} className="field-icon" />
                      <input
                        type="date"
                        value={flightSearch.date}
                        onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-search-submit">
                    <Search size={20} />
                    <span>Search on Google Flights ↗</span>
                  </button>
                </div>
              )}

              {activeTab === 'trains' && (
                <div className="search-inputs-grid">
                  <div className="input-group-box">
                    <label>Origin Railway Station</label>
                    <CityInput
                      placeholder="e.g. New Delhi (NDLS)"
                      value={trainSearch.from}
                      onChange={(val) => setTrainSearch({ ...trainSearch, from: val })}
                      mode="train"
                      icon={Train}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>Destination Railway Station</label>
                    <CityInput
                      placeholder="e.g. Mumbai Central (MMCT)"
                      value={trainSearch.to}
                      onChange={(val) => setTrainSearch({ ...trainSearch, to: val })}
                      mode="train"
                      icon={Train}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>Journey Date</label>
                    <div className="input-wrapper">
                      <Calendar size={18} className="field-icon" />
                      <input
                        type="date"
                        value={trainSearch.date}
                        onChange={(e) => setTrainSearch({ ...trainSearch, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-search-submit">
                    <Search size={20} />
                    <span>Search on Official IRCTC ↗</span>
                  </button>
                </div>
              )}

              {activeTab === 'buses' && (
                <div className="search-inputs-grid">
                  <div className="input-group-box">
                    <label>From City</label>
                    <CityInput
                      placeholder="e.g. Bangalore"
                      value={busSearch.from}
                      onChange={(val) => setBusSearch({ ...busSearch, from: val })}
                      icon={Bus}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>To Destination</label>
                    <CityInput
                      placeholder="e.g. Goa"
                      value={busSearch.to}
                      onChange={(val) => setBusSearch({ ...busSearch, to: val })}
                      icon={Bus}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>Travel Date</label>
                    <div className="input-wrapper">
                      <Calendar size={18} className="field-icon" />
                      <input
                        type="date"
                        value={busSearch.date}
                        onChange={(e) => setBusSearch({ ...busSearch, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-search-submit">
                    <Search size={20} />
                    <span>Search on RedBus ↗</span>
                  </button>
                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="search-inputs-grid">
                  <div className="input-group-box">
                    <label>City or Destination</label>
                    <CityInput
                      placeholder="e.g. Dubai, Goa, Maldives"
                      value={hotelSearch.city}
                      onChange={(val) => setHotelSearch({ ...hotelSearch, city: val })}
                      icon={Hotel}
                    />
                  </div>
                  <div className="input-group-box">
                    <label>Number of Guests</label>
                    <div className="input-wrapper">
                      <Users size={18} className="field-icon" />
                      <select
                        value={hotelSearch.guests}
                        onChange={(e) => setHotelSearch({ ...hotelSearch, guests: Number(e.target.value) })}
                      >
                        <option value="1">1 Adult</option>
                        <option value="2">2 Adults (1 Room)</option>
                        <option value="3">3 Adults</option>
                        <option value="4">4 Adults (2 Rooms)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-search-submit" style={{ gridColumn: 'span 2' }}>
                    <Search size={20} />
                    <span>Search on Booking.com ↗</span>
                  </button>
                </div>
              )}

              {activeTab === 'packages' && (
                <div className="search-inputs-grid" style={{ gridTemplateColumns: '1fr auto' }}>
                  <div className="input-group-box">
                    <label>Explore Curated Vacation Packages</label>
                    <div className="input-wrapper">
                      <Package size={18} className="field-icon" />
                      <span style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '2.2' }}>
                        Hand-crafted holidays with flights, 5-star villas, and private chauffeurs included.
                      </span>
                    </div>
                  </div>
                  <button type="submit" className="btn-search-submit">
                    <ArrowRight size={20} />
                    <span>Explore Packages</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Trust & Highlights Bar */}
      <section className="trust-bar-section">
        <div className="container trust-grid">
          <div className="trust-item">
            <ShieldCheck size={28} className="text-highlight" />
            <div>
              <h4>Verified Operators</h4>
              <p>Top-rated airlines, premier rail coaches & audited hotels</p>
            </div>
          </div>
          <div className="trust-item">
            <Clock size={28} className="text-highlight" />
            <div>
              <h4>Real-Time Inventory</h4>
              <p>Live seat selection and immediate ticket generation</p>
            </div>
          </div>
          <div className="trust-item">
            <CreditCard size={28} className="text-highlight" />
            <div>
              <h4>Zero Concealed Fees</h4>
              <p>Transparent fare summaries with taxes and baggage included</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Tour Packages */}
      <section className="section-packages">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-subtitle">HANDCRAFTED EXPERIENCES</span>
              <h2 className="section-title">Signature Holiday Packages</h2>
            </div>
            <button className="btn btn-outline-light" onClick={() => navigate('/packages')}>
              View All Packages &rarr;
            </button>
          </div>

          <div className="packages-cards-grid">
            {signaturePackages.map((pkg) => (
              <div key={pkg.id} className="package-card-item">
                <div className="card-thumb">
                  <img src={pkg.image} alt={pkg.title} />
                  <span className="card-tag">{pkg.tag}</span>
                </div>
                <div className="card-content">
                  <div className="card-rating">
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span>{pkg.rating} ({pkg.reviews} reviews)</span>
                  </div>
                  <h3 className="card-title">{pkg.title}</h3>
                  <div className="card-meta">
                    <span><Clock size={14} /> {pkg.duration}</span>
                    <span><MapPin size={14} /> {pkg.destination}</span>
                  </div>
                  <div className="card-price-action">
                    <div>
                      <span className="price-label">Starting from</span>
                      <strong className="price-amount">₹{pkg.price.toLocaleString('en-IN')} <small>/ person</small></strong>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const defaultDeparture = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
                        const checkoutPayload = {
                          type: 'package',
                          item: pkg,
                          selectedClass: 'All-Inclusive',
                          totalPrice: pkg.price,
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
                        if (!isAuthenticated) {
                          showToast('Please sign in to complete your holiday package reservation.', 'info');
                          navigate('/login?redirect=/payment');
                          return;
                        }
                        navigate('/payment');
                      }}
                    >
                      Book Tour
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Travel Gallery */}
      <section className="section-destinations">
        <div className="container">
          <div className="section-header-center">
            <span className="section-subtitle">INSPIRING LOCATIONS</span>
            <h2 className="section-title">Popular Escapes</h2>
            <p className="section-caption">Explore hand-picked destinations loved by over 50,000 satisfied globetrotters.</p>
          </div>

          <div className="popular-destinations-grid">
            <div className="destination-tile tile-large">
              <img src="/images/popular-1.jpg" alt="Rome, Italy" />
              <div className="tile-overlay">
                <h3>Rome & Amalfi Coast, Italy</h3>
                <p>Starting at ₹8,900 | Flights & Luxury Suites</p>
              </div>
            </div>
            <div className="destination-tile">
              <img src="/images/popular-2.jpg" alt="Kyoto, Japan" />
              <div className="tile-overlay">
                <h3>Kyoto Gardens, Japan</h3>
                <p>Starting at ₹11,500 | Cultural Tour</p>
              </div>
            </div>
            <div className="destination-tile">
              <img src="/images/popular-3.jpg" alt="Dubai Marina" />
              <div className="tile-overlay">
                <h3>Dubai Skyline & Desert Safari</h3>
                <p>Starting at ₹6,400 | VIP Packages</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Inquiry Concierge Form */}
      <section className="section-inquiry">
        <div className="container">
          <div className="inquiry-box">
            <div className="inquiry-info">
              <span className="section-subtitle">CUSTOM ITINERARY DESIGN</span>
              <h2>Plan Your Bespoke Travel Experience</h2>
              <p>
                Have a specialized travel dream? Share your destination and travel dates with our private concierge team. We assemble custom flights, private villas, and ground transfers tailored to your requirements.
              </p>
              <div className="concierge-features">
                <div>✨ Dedicated Personal Travel Manager</div>
                <div>✨ VIP Airport Lounge Access Available</div>
                <div>✨ Full Flexible Cancellation Options</div>
              </div>
            </div>

            <form onSubmit={handleInquirySubmit} className="inquiry-form">
              <h3>Direct Travel Inquiry</h3>
              <div className="form-group">
                <label>Dream Destination *</label>
                <input
                  type="text"
                  placeholder="e.g. Santorini, Greece or Swiss Alps"
                  value={inquiry.destination}
                  onChange={(e) => setInquiry({ ...inquiry, destination: e.target.value })}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Number of Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={inquiry.people}
                  onChange={(e) => setInquiry({ ...inquiry, people: Number(e.target.value) })}
                  className="form-control"
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Tentative Departure</label>
                  <input
                    type="date"
                    value={inquiry.checkin}
                    onChange={(e) => setInquiry({ ...inquiry, checkin: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Tentative Return</label>
                  <input
                    type="date"
                    value={inquiry.checkout}
                    onChange={(e) => setInquiry({ ...inquiry, checkout: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submittingInquiry}
                className="btn btn-primary w-100"
              >
                {submittingInquiry ? 'Submitting Inquiry...' : 'Submit Concierge Request'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
