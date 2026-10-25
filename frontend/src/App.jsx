import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Trains from './pages/Trains';
import Buses from './pages/Buses';
import Hotels from './pages/Hotels';
import Packages from './pages/Packages';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<ProtectedRoute><Flights /></ProtectedRoute>} />
          <Route path="/trains" element={<ProtectedRoute><Trains /></ProtectedRoute>} />
          <Route path="/buses" element={<ProtectedRoute><Buses /></ProtectedRoute>} />
          <Route path="/hotels" element={<ProtectedRoute><Hotels /></ProtectedRoute>} />
          <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
