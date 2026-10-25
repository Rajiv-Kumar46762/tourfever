import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner mb-3"></div>
        <p style={{ color: 'var(--text-muted)' }}>Checking authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    showToast('Please sign in to search and access live travel options.', 'info');
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}
