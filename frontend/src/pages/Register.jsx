import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Compass, Lock, User, Mail, Phone, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/my-bookings';

  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 4) {
      showToast('Password must be at least 4 characters long.', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      showToast('🎉 Account registered successfully! Welcome to Tour Fever.', 'success');
      navigate(redirect);
    } catch (err) {
      showToast(err.message || 'Registration failed. Username may already exist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card animate-scale-up">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Compass size={32} className="text-highlight" />
          </div>
          <h2>Create Traveler Account</h2>
          <p>Register once to book across all flights, trains, buses, and hotels.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group mb-3">
            <label>Full Name *</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rajiv Kumar Rai"
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Desired Username *</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. rajiv_traveler"
              />
            </div>
          </div>

          <div className="form-grid-2 mb-3">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rajiv@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9065912445"
                />
              </div>
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Account Password *</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 btn-auth-submit"
          >
            {loading ? 'Registering Account...' : 'Create My Free Account'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already registered? </span>
          <Link to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
