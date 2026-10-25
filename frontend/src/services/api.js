const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Flights
  getFlights: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/flights${query ? `?${query}` : ''}`);
  },
  bookFlight: (bookingData) => request('/flights/book', { method: 'POST', body: JSON.stringify(bookingData) }),

  // Trains
  getTrains: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/trains${query ? `?${query}` : ''}`);
  },
  bookTrain: (bookingData) => request('/trains/book', { method: 'POST', body: JSON.stringify(bookingData) }),

  // Buses
  getBuses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/buses${query ? `?${query}` : ''}`);
  },
  bookBus: (bookingData) => request('/buses/book', { method: 'POST', body: JSON.stringify(bookingData) }),

  // Hotels
  getHotels: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/hotels${query ? `?${query}` : ''}`);
  },
  bookHotel: (bookingData) => request('/hotels/book', { method: 'POST', body: JSON.stringify(bookingData) }),

  // Packages
  getPackages: () => request('/packages'),
  bookPackage: (bookingData) => request('/packages/book', { method: 'POST', body: JSON.stringify(bookingData) }),

  // Unified Bookings
  getMyBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings/my${query ? `?${query}` : ''}`);
  },
  cancelBooking: (type, bookingId, reason) =>
    request('/bookings/cancel', {
      method: 'POST',
      body: JSON.stringify({ bookingType: type, bookingId, reason }),
    }),

  // Payments
  processPayment: (paymentData) => request('/payments/process', { method: 'POST', body: JSON.stringify(paymentData) }),

  // Dashboard & Inquiries
  getDashboard: () => request('/dashboard'),
  submitInquiry: (inquiryData) => request('/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) }),
  getInquiries: () => request('/inquiries'),

  // Wishlist / Saved Trips
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (item) => request('/wishlist/toggle', { method: 'POST', body: JSON.stringify(item) }),
  removeFromWishlist: (id) => request(`/wishlist/${id}`, { method: 'DELETE' }),

  // Reviews & Ratings
  getReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reviews${query ? `?${query}` : ''}`);
  },
  addReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),

  // Promo Codes & Coupons
  getActiveCoupons: () => request('/coupons/active'),
  validateCoupon: (code, totalAmount) =>
    request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, totalAmount }),
    }),
};
