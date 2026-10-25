import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Plane, 
  Train, 
  Bus, 
  Hotel, 
  Package, 
  Ticket, 
  BarChart3, 
  User, 
  LogOut, 
  PhoneCall, 
  Menu, 
  X,
  Compass,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Compass size={18} /> },
    { to: '/flights', label: 'Flights', icon: <Plane size={18} /> },
    { to: '/trains', label: 'Trains', icon: <Train size={18} /> },
    { to: '/buses', label: 'Buses', icon: <Bus size={18} /> },
    { to: '/hotels', label: 'Hotels', icon: <Hotel size={18} /> },
    { to: '/packages', label: 'Packages', icon: <Package size={18} /> },
    { to: '/my-bookings', label: 'My Bookings', icon: <Ticket size={18} /> },
    { to: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  ];

  return (
    <header className="navbar-header">
      {/* Top Banner */}
      <div className="navbar-top-bar">
        <div className="container top-bar-content">
          <div className="helpline">
            <PhoneCall size={14} className="icon-pulse" />
            <span>24/7 Travel Concierge:</span>
            <a href="tel:+919065912445" className="helpline-num">+91 9065912445</a>
          </div>
          <div className="top-features">
            <span>🛡️ Best Rate Guarantee</span>
            <span className="dot">•</span>
            <span>⚡ Instant Confirmation</span>
            <span className="dot">•</span>
            <span>💳 100% Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="navbar-main">
        <div className="container nav-content">
          {/* Logo */}
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="logo-badge">
              <Compass className="brand-icon" size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title">TOUR <span className="text-highlight">FEVER</span></span>
              <span className="brand-tagline">EXPLORE THE EXTRAORDINARY</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  if (!isAuthenticated && link.to !== '/') {
                    e.preventDefault();
                    showToast(`Please sign in to search and access ${link.label}.`, 'info');
                    navigate(`/login?redirect=${encodeURIComponent(link.to)}`);
                  }
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Actions */}
          <div className="nav-actions">
            {/* Theme Toggle Button (Available Both Before & After Login) */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Website Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="theme-sun-icon" /> : <Moon size={18} className="theme-moon-icon" />}
              <span className="theme-label-txt">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {isAuthenticated ? (
              <div className="user-dropdown-container">
                <button
                  className="user-pill-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-info-text">
                    <span className="user-name">{user?.name || user?.username}</span>
                    <span className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Traveler'}</span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu animate-fade-in">
                    <div className="dropdown-header">
                      <strong>{user?.name || user?.username}</strong>
                      <span className="user-email">{user?.email || 'Logged in'}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link
                      to="/my-bookings"
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Ticket size={16} /> My Reservations
                    </Link>
                    <Link
                      to="/dashboard"
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BarChart3 size={16} /> My Travel Stats
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-slide-down">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (!isAuthenticated && link.to !== '/') {
                    e.preventDefault();
                    showToast(`Please sign in to search and access ${link.label}.`, 'info');
                    navigate(`/login?redirect=${encodeURIComponent(link.to)}`);
                  }
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mobile-theme-row mb-3">
            <button
              type="button"
              className="theme-toggle-btn w-100"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={18} className="theme-sun-icon" /> : <Moon size={18} className="theme-moon-icon" />}
              <span>Switch to {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>
          <div className="mobile-auth-actions">
            {isAuthenticated ? (
              <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out ({user?.name || user?.username})
              </button>
            ) : (
              <div className="mobile-btn-grid">
                <Link
                  to="/login"
                  className="btn btn-outline-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
