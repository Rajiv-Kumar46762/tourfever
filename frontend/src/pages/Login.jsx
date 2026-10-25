import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Compass, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/my-bookings';

  const { login } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('wanderer');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
      showToast('✨ Welcome back! Login successful.', 'success');
      if (redirect && (redirect.startsWith('http://') || redirect.startsWith('https://'))) {
        window.location.href = redirect;
      } else {
        navigate(redirect || '/');
      }
    } catch (err) {
      showToast(err.message || 'Invalid username or password.', 'error');
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
          <h2>Welcome Back</h2>
          <p>Sign in to access your travel itineraries and bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group mb-3">
            <label>Username or Email Address</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <div className="demo-credentials-hint">
            <span>Demo credentials: <strong>wanderer</strong> / <strong>password123</strong></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 btn-auth-submit"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Don't have an account yet? </span>
          <Link to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
            Create Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
