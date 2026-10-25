import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart, ShieldCheck, CreditCard, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top-grid">
        {/* Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <Compass size={28} className="text-highlight" />
            <span className="brand-name">TOUR <span className="text-highlight">FEVER</span></span>
          </div>
          <p className="footer-desc">
            Your premier luxury travel & booking concierge. Seamlessly booking world-class flights, premium trains, express buses, and hand-picked boutique hotels worldwide.
          </p>
          <div className="security-badges">
            <div className="badge-item"><ShieldCheck size={16} /> 256-Bit SSL Encrypted</div>
            <div className="badge-item"><Award size={16} /> Certified Travel Partner</div>
            <div className="badge-item"><CreditCard size={16} /> Verified Payments</div>
          </div>
        </div>

        {/* Quick Vertical Portals */}
        <div className="footer-col">
          <h4 className="footer-title">Travel Portals</h4>
          <ul className="footer-links">
            <li><Link to="/flights">Domestic & Global Flights</Link></li>
            <li><Link to="/trains">Express Rail Bookings</Link></li>
            <li><Link to="/buses">Volvo & Sleeper Bus Lines</Link></li>
            <li><Link to="/hotels">5-Star & Boutique Hotels</Link></li>
            <li><Link to="/packages">Signature Holiday Packages</Link></li>
          </ul>
        </div>

        {/* Account & Support */}
        <div className="footer-col">
          <h4 className="footer-title">Manage & Support</h4>
          <ul className="footer-links">
            <li><Link to="/my-bookings">Find & Track My Bookings</Link></li>
            <li><Link to="/dashboard">Travel Insights Dashboard</Link></li>
            <li><Link to="/login">Sign In to Traveler Account</Link></li>
            <li><Link to="/register">Create Free Account</Link></li>
            <li><a href="#faq">Cancellation & Refund Policy</a></li>
          </ul>
        </div>

        {/* Contact Concierge */}
        <div className="footer-col contact-col">
          <h4 className="footer-title">24/7 Concierge</h4>
          <p className="contact-item">
            <Phone size={16} className="text-highlight" />
            <span>+91 9065912445</span>
          </p>
          <p className="contact-item">
            <Mail size={16} className="text-highlight" />
            <span>concierge@tourfever.com</span>
          </p>
          <p className="contact-item">
            <MapPin size={16} className="text-highlight" />
            <span>Connaught Place, New Delhi, India</span>
          </p>
          <div className="payment-icons-strip">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>RuPay</span>
            <span>UPI</span>
            <span>NetBanking</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {new Date().getFullYear()} Tour Fever Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="love-tag">
            Engineered with <Heart size={14} className="text-danger-inline" /> for World Explorers
          </p>
        </div>
      </div>
    </footer>
  );
}
