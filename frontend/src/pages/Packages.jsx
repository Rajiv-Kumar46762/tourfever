import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { 
  Package as PackageIcon, 
  Clock, 
  MapPin, 
  Star, 
  Check, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Plane,
  Hotel,
  Heart,
  MessageSquare,
  X,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function Packages() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [savedPackageIds, setSavedPackageIds] = useState([]);
  const [selectedReviewPkg, setSelectedReviewPkg] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 4.9, totalReviews: 0 });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userEligible, setUserEligible] = useState({
    hasBooked: false,
    alreadyReviewed: false,
    canReview: false,
    reason: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to view and reserve holiday packages.', 'info');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated]);

  // Load user's saved wishlist on mount
  useEffect(() => {
    if (isAuthenticated) {
      api.getWishlist()
        .then((res) => {
          if (res?.data) {
            setSavedPackageIds(res.data.map(item => item.packageId));
          }
        })
        .catch((err) => console.warn('Wishlist load note:', err.message));
    }
  }, [isAuthenticated]);

  const packagesList = [
    {
      id: 'pkg-1',
      title: 'Maldives Luxury Lagoon & Water Villa',
      destination: 'Maldives',
      duration: '5 Days / 4 Nights',
      price: 89500,
      image: '/images/packege-1.jpg',
      rating: 4.9,
      reviews: 142,
      inclusions: ['Roundtrip Sea Plane Transfers', 'Overwater Pool Villa', 'All-Inclusive Gourmet Dining', 'Snorkeling & Coral Reef Safari'],
      highlights: 'Indulge in crystal clear turquoise waters, private overwater deck with infinity plunge pool, and daily sunset cruises.'
    },
    {
      id: 'pkg-2',
      title: 'Swiss Alps & Glacier Express Grand Tour',
      destination: 'Switzerland (Zurich, Zermatt, St. Moritz)',
      duration: '7 Days / 6 Nights',
      price: 165000,
      image: '/images/packege-2.jpg',
      rating: 5.0,
      reviews: 98,
      inclusions: ['First Class Glacier Express Panoramic Train', '5-Star Alpine Chalets', 'Matterhorn Cable Car Pass', 'Swiss Travel Pass Unlimited'],
      highlights: 'Marvel at snow-capped peaks, alpine meadows, and UNESCO world heritage rail routes from luxury glass-domed railcars.'
    },
    {
      id: 'pkg-3',
      title: 'Kyoto Zen Temples & Heritage Discovery',
      destination: 'Kyoto & Tokyo, Japan',
      duration: '6 Days / 5 Nights',
      price: 128000,
      image: '/images/packege-3.jpg',
      rating: 4.8,
      reviews: 110,
      inclusions: ['Shinkansen Bullet Train Passes', 'Traditional Ryokan Stay with Onsen', 'Private Tea Ceremony Masterclass', 'English Speaking Local Historian'],
      highlights: 'Experience centuries-old bamboo groves, Golden Pavilions, serene stone gardens, and world-renowned kaiseki gastronomy.'
    },
    {
      id: 'pkg-4',
      title: 'Dubai Marina Luxury & Desert Glamping',
      destination: 'Dubai, UAE',
      duration: '5 Days / 4 Nights',
      price: 64500,
      image: '/images/popular-3.jpg',
      rating: 4.9,
      reviews: 84,
      inclusions: ['Private Luxury Yacht Cruise', '5-Star Marina Hotel Suite', 'VIP Dune Bashing & Bedouin Camp', 'Burj Khalifa Top Floor Tickets'],
      highlights: 'Modern futuristic skyline meets golden desert sands with private chauffeur and Michelin-starred culinary dining.'
    }
  ];

  const handleToggleWishlist = async (pkg) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save trips to your wishlist.', 'info');
      navigate('/login?redirect=/packages');
      return;
    }

    try {
      const res = await api.toggleWishlist({
        packageId: pkg.id,
        packageTitle: pkg.title,
        destination: pkg.destination,
        duration: pkg.duration,
        price: pkg.price,
        image: pkg.image,
        rating: pkg.rating
      });

      if (res.isSaved) {
        setSavedPackageIds(prev => [...prev, pkg.id]);
        showToast(res.message || `"${pkg.title}" added to your wishlist!`, 'success');
      } else {
        setSavedPackageIds(prev => prev.filter(id => id !== pkg.id));
        showToast(res.message || `"${pkg.title}" removed from your wishlist.`, 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update wishlist.', 'error');
    }
  };

  const handleOpenReviews = async (pkg) => {
    setSelectedReviewPkg(pkg);
    setReviewLoading(true);
    setNewReview({ rating: 5, comment: '' });
    setUserEligible({ hasBooked: false, alreadyReviewed: false, canReview: false, reason: '' });
    try {
      const res = await api.getReviews({ packageTitle: pkg.title });
      setReviewsList(res.data || []);
      if (res.stats) {
        setReviewStats(res.stats);
      }
      if (res.userEligible) {
        setUserEligible(res.userEligible);
      }
    } catch (err) {
      console.warn('Reviews load error:', err.message);
      setReviewsList([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      showToast('Please write a comment for your review.', 'error');
      return;
    }
    if (!isAuthenticated) {
      showToast('Please sign in to publish your traveler review.', 'info');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.addReview({
        packageId: selectedReviewPkg.id,
        packageTitle: selectedReviewPkg.title,
        rating: newReview.rating,
        comment: newReview.comment
      });

      showToast(res.message || 'Thank you! Your review has been saved in the database.', 'success');
      setNewReview({ rating: 5, comment: '' });
      setUserEligible({ hasBooked: true, alreadyReviewed: true, canReview: false, reason: 'Reviewed' });

      // Refresh reviews list
      const updated = await api.getReviews({ packageTitle: selectedReviewPkg.title });
      setReviewsList(updated.data || []);
      if (updated.stats) {
        setReviewStats(updated.stats);
      }
    } catch (err) {
      showToast(err.message || 'Failed to post review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBookPackage = (pkg) => {
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
    localStorage.setItem('pendingCheckout', JSON.stringify(checkoutPayload));
    if (!isAuthenticated) {
      showToast('Please sign in to complete your holiday package reservation.', 'info');
      navigate('/login?redirect=/payment');
      return;
    }
    navigate('/payment');
  };

  return (
    <div className="packages-page container py-4">
      {/* Header */}
      <div className="page-header-banner">
        <div className="header-badge">
          <PackageIcon size={16} /> <span>ALL-INCLUSIVE CURATED ITINERARIES</span>
        </div>
        <h1>Signature Vacation Packages</h1>
        <p>Expertly crafted vacation packages combining 5-star villas, premium transit, and private excursions.</p>
      </div>

      <div className="packages-catalogue-grid">
        {packagesList.map((pkg) => {
          const isSaved = savedPackageIds.includes(pkg.id);
          return (
            <div key={pkg.id} className="package-full-card animate-fade-in">
              <div className="pkg-image-wrapper">
                <img src={pkg.image} alt={pkg.title} />

                {/* Rating Badge (Clickable to view Reviews) */}
                <button
                  type="button"
                  className="pkg-badge-floating"
                  onClick={() => handleOpenReviews(pkg)}
                  title="Click to view traveler reviews and ratings"
                  style={{
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{pkg.rating} ({pkg.reviews} reviews)</span>
                </button>

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  className="pkg-wishlist-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(pkg);
                  }}
                  title={isSaved ? "Saved to Wishlist (Click to remove)" : "Save to Wishlist"}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isSaved ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: isSaved ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 5
                  }}
                >
                  <Heart
                    size={18}
                    fill={isSaved ? '#ef4444' : 'transparent'}
                    color={isSaved ? '#ef4444' : '#ffffff'}
                  />
                </button>
              </div>

              <div className="pkg-body-wrapper">
                <div className="pkg-top-meta">
                  <span className="pkg-meta-item"><Clock size={15} /> {pkg.duration}</span>
                  <span className="pkg-meta-item"><MapPin size={15} /> {pkg.destination}</span>
                </div>

                <h2 className="pkg-title">{pkg.title}</h2>
                <p className="pkg-highlights-txt">{pkg.highlights}</p>

                <div className="pkg-inclusions-list">
                  <h4>What's Included in this Package:</h4>
                  <div className="inclusions-grid">
                    {pkg.inclusions.map((inc, i) => (
                      <div key={i} className="inclusion-pill">
                        <Check size={14} className="text-highlight" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pkg-action-footer">
                  <div className="pkg-pricing-box">
                    <span className="pkg-from">All-Inclusive Per Person</span>
                    <strong className="pkg-price-val">₹{pkg.price.toLocaleString('en-IN')}</strong>
                    <span className="pkg-tax-note">Taxes & transfers included</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => handleOpenReviews(pkg)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={16} />
                      <span>Reviews</span>
                    </button>

                    <button
                      className="btn btn-primary btn-book-pkg"
                      onClick={() => handleBookPackage(pkg)}
                    >
                      <span>Reserve Package</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Traveler Reviews & Star Ratings Modal */}
      {selectedReviewPkg && (
        <div 
          className="modal-overlay animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setSelectedReviewPkg(null)}
        >
          <div 
            className="modal-dialog animate-scale-up"
            style={{
              background: 'var(--bg-card, #1e293b)',
              color: 'var(--text-main, #f8fafc)',
              borderRadius: 'var(--radius-lg, 16px)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--coral-primary, #f97316)', textTransform: 'uppercase' }}>
                  VERIFIED REVIEWS & RATINGS
                </span>
                <h3 style={{ fontSize: '1.25rem', margin: '4px 0', fontWeight: 700 }}>
                  {selectedReviewPkg.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span>{reviewStats.avgRating || selectedReviewPkg.rating} / 5.0</span>
                  </div>
                  <span>•</span>
                  <span>{reviewsList.length} Traveler Review{reviewsList.length !== 1 ? 's' : ''} in Database</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewPkg(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Review Section: Restricted to travelers who booked the package */}
            {userEligible.canReview ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--coral-primary)" />
                    <span>Write Your Verified Traveler Review</span>
                  </h4>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    <CheckCircle size={12} /> Confirmed Reservation
                  </span>
                </div>

                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Select Your Rating:
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            transform: star <= newReview.rating ? 'scale(1.15)' : 'scale(1)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Star
                            size={22}
                            fill={star <= newReview.rating ? '#f59e0b' : 'transparent'}
                            color={star <= newReview.rating ? '#f59e0b' : '#64748b'}
                          />
                        </button>
                      ))}
                      <span style={{ marginLeft: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', alignSelf: 'center' }}>
                        {newReview.rating} Star{newReview.rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <textarea
                      rows={3}
                      placeholder="Share your verified journey highlights, villa stay, excursions, or dining recommendations..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        padding: '10px',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        resize: 'vertical'
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {submittingReview ? 'Recording to Database...' : 'Submit Verified Review'}
                  </button>
                </form>
              </div>
            ) : userEligible.alreadyReviewed ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle size={22} color="#10b981" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#10b981', display: 'block', marginBottom: '2px' }}>
                    Verified Review Submitted
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Your feedback is published in the database and visible to other travelers. Thank you!
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '16px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <ShieldCheck size={22} color="var(--coral-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                    Verified Traveler Reviews Only
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: '1.45' }}>
                    To ensure 100% authentic ratings, only travelers who have completed or confirmed a reservation for <strong>{selectedReviewPkg.title}</strong> can write a review.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const pkgToBook = selectedReviewPkg;
                      setSelectedReviewPkg(null);
                      handleBookPackage(pkgToBook);
                    }}
                    style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Reserve Package to Unlock Review &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Reviews List */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-muted)' }}>
                Traveler Feedback ({reviewsList.length})
              </h4>
              {reviewLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)' }}>
                  Loading database reviews...
                </div>
              ) : reviewsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>Be the first explorer to review this vacation package!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviewsList.map((rev) => (
                    <div 
                      key={rev._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md, 8px)',
                        padding: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{rev.userName || 'Valued Traveler'}</strong>
                          {rev.isVerifiedTraveler && (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '0.72rem', 
                                color: '#10b981', 
                                background: 'rgba(16, 185, 129, 0.12)', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontWeight: 600
                              }}
                            >
                              <CheckCircle size={12} /> Verified Traveler
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              size={13} 
                              fill={s <= rev.rating ? '#f59e0b' : 'transparent'} 
                              color={s <= rev.rating ? '#f59e0b' : '#64748b'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.45', margin: '6px 0' }}>
                        "{rev.comment}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {rev.travelDate ? `Traveled ${rev.travelDate}` : new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
