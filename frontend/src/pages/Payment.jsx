import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  CheckCircle, 
  Lock, 
  ArrowLeft, 
  Receipt,
  Download,
  Calendar,
  User,
  Clock,
  Tag,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Promo Code / Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Card Form State
  const [cardData, setCardData] = useState({
    cardNumber: '4242 •••• •••• 4242',
    rawCardNumber: '4242424242424242',
    cardHolder: user?.name?.toUpperCase() || 'VALUED TRAVELER',
    expiry: '12/28',
    cvv: '888',
  });

  // Lead Traveler & Contact Details Form State
  const [passengerDetails, setPassengerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: '28',
    gender: 'male',
  });

  // UPI Form State
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');

  // Bank Form State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingCheckout') || localStorage.getItem('pendingCheckout');
    if (!raw) {
      showToast('No pending reservation found. Please select a package or trip to book.', 'info');
      navigate('/packages');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setCheckoutData(parsed);
      const leadName = parsed.formData?.name || user?.name || user?.username || '';
      const leadEmail = parsed.formData?.email || user?.email || '';
      const leadPhone = parsed.formData?.phone || user?.phone || '';
      const leadAge = parsed.formData?.age || '28';
      const leadGender = parsed.formData?.gender || 'Male';

      setPassengerDetails({
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        age: leadAge,
        gender: leadGender,
      });

      if (leadName) {
        setCardData((prev) => ({
          ...prev,
          cardHolder: leadName.toUpperCase(),
        }));
      }
    } catch (e) {
      navigate('/packages');
    }
  }, [user]);

  useEffect(() => {
    api.getActiveCoupons()
      .then((res) => {
        if (res?.data) {
          setAvailableCoupons(res.data);
        }
      })
      .catch((err) => console.warn('Coupons load note:', err.message));
  }, []);

  const totalPrice = checkoutData?.totalPrice || 0;
  const finalPayableAmount = appliedCoupon ? appliedCoupon.finalAmount : totalPrice;

  const handleApplyCoupon = async (codeToUse) => {
    const targetCode = (codeToUse || couponInput || '').trim();
    if (!targetCode) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }

    setCouponLoading(true);
    try {
      const res = await api.validateCoupon(targetCode, totalPrice);
      setAppliedCoupon(res);
      setCouponInput(res.code);
      showToast(res.message || `Coupon "${res.code}" applied!`, 'success');
    } catch (err) {
      showToast(err.message || 'Invalid or expired coupon.', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    showToast('Coupon removed.', 'info');
  };

  if (!checkoutData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner"></div>
        <p>Loading checkout session...</p>
      </div>
    );
  }

  const { type, item, selectedClass, selectedSeats, formData } = checkoutData;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const activeDetails = {
      ...formData,
      ...passengerDetails,
    };

    try {
      let bookingResponse;

      // 1. Dispatch booking creation based on vertical
      if (type === 'flight') {
        bookingResponse = await api.bookFlight({
          flightId: item._id,
          tripType: 'one-way',
          travelDate: activeDetails.travelDate,
          selectedClass: selectedClass || 'Economy',
          passengers: [{
            title: 'Mr',
            firstName: activeDetails.name.split(' ')[0] || activeDetails.name,
            lastName: activeDetails.name.split(' ').slice(1).join(' ') || 'Traveler',
            age: Number(activeDetails.age) || 28,
            gender: activeDetails.gender,
          }],
          contactDetails: {
            name: activeDetails.name,
            email: activeDetails.email,
            phone: activeDetails.phone,
          },
          baseFare: totalPrice - 35,
          taxesAndFees: 35,
          totalAmount: totalPrice,
        });
      } else if (type === 'train') {
        const normalizedGender = (activeDetails.gender === 'female' || activeDetails.gender === 'Female') ? 'Female' : 'Male';
        bookingResponse = await api.bookTrain({
          trainId: item._id,
          journeyDate: activeDetails.travelDate || new Date().toISOString().split('T')[0],
          selectedClass: selectedClass || '3A',
          quota: 'General',
          passengers: [{
            fullName: activeDetails.name || user?.name || user?.username || 'Valued Traveler',
            age: Number(activeDetails.age) || 28,
            gender: normalizedGender,
            berthPreference: activeDetails.berthPreference || 'No Preference',
          }],
          contactDetails: {
            name: activeDetails.name || user?.name || user?.username || 'Valued Traveler',
            email: activeDetails.email || user?.email || 'traveler@tourfever.com',
            phone: activeDetails.phone || user?.phone || '+91 9876543210',
          },
          paymentMethod,
          cardNumber: cardData.cardNumber,
          cardHolder: cardData.cardHolder,
          cardLast4: cardData.cardNumber?.replace(/\s+/g, '').slice(-4) || '4242',
          farePerPassenger: totalPrice,
          cateringFee: 0,
          totalAmount: totalPrice,
        });
      } else if (type === 'bus') {
        bookingResponse = await api.bookBus({
          busId: item._id,
          travelDate: activeDetails.travelDate,
          selectedSeats: selectedSeats || ['L1'],
          passengers: (selectedSeats || ['L1']).map((seatNum) => ({
            fullName: activeDetails.name,
            age: Number(activeDetails.age) || 28,
            gender: activeDetails.gender,
            seatNumber: seatNum,
          })),
          boardingPoint: activeDetails.boardingPoint || item.boardingPoints?.[0]?.location,
          droppingPoint: activeDetails.droppingPoint || item.droppingPoints?.[0]?.location,
          contactDetails: {
            name: activeDetails.name,
            email: activeDetails.email,
            phone: activeDetails.phone,
          },
          totalAmount: totalPrice,
        });
      } else if (type === 'hotel') {
        bookingResponse = await api.bookHotel({
          hotelId: item._id,
          roomType: selectedClass || 'Deluxe Room',
          pricePerNight: item.startingPrice || 150,
          checkInDate: activeDetails.checkInDate,
          checkOutDate: activeDetails.checkOutDate,
          guestsCount: Number(activeDetails.guestsCount) || 1,
          guests: [{
            title: 'Mr',
            fullName: activeDetails.name,
            age: Number(activeDetails.age) || 30,
          }],
          primaryContact: {
            fullName: activeDetails.name,
            email: activeDetails.email,
            phone: activeDetails.phone,
            specialRequests: activeDetails.specialRequests,
          },
          totalAmount: totalPrice,
        });
      } else if (type === 'package') {
        const normalizedGender = (activeDetails.gender === 'female' || activeDetails.gender === 'Female') ? 'Female' : 'Male';
        bookingResponse = await api.bookPackage({
          packageTitle: item.title,
          destination: item.destination,
          duration: item.duration,
          travelDate: activeDetails.travelDate || new Date().toISOString().split('T')[0],
          paxCount: Number(activeDetails.guestsCount) || 1,
          pricePerPerson: item.price,
          passengers: [{
            fullName: activeDetails.name || user?.name || user?.username || 'Valued Traveler',
            age: Number(activeDetails.age) || 28,
            gender: normalizedGender,
          }],
          primaryContact: {
            fullName: activeDetails.name || user?.name || user?.username || 'Valued Traveler',
            email: activeDetails.email || user?.email || 'traveler@tourfever.com',
            phone: activeDetails.phone || user?.phone || '+91 9876543210',
          },
          paymentMethod,
          cardNumber: cardData.cardNumber,
          cardHolder: cardData.cardHolder,
          cardLast4: cardData.cardNumber?.replace(/\s+/g, '').slice(-4) || '4242',
          couponCode: appliedCoupon?.code,
          discountAmount: appliedCoupon?.discountAmount || 0,
          totalAmount: finalPayableAmount,
        });
      }

      // Extract generated bookingId from either data or booking field
      const bookingObj = bookingResponse?.booking || bookingResponse?.data;
      const createdBookingId = bookingObj?.bookingId || `TF-${type.toUpperCase()}-${Date.now()}`;
      const referenceCode =
        bookingObj?.referenceNumber ||
        bookingObj?.pnr ||
        bookingObj?.ticketNumber ||
        bookingObj?.confirmationCode ||
        'TF-REF-9988';

      // 2. Dispatch Payment transaction record if not already recorded
      let paymentRecord;
      try {
        if (bookingObj?.paymentId) {
          paymentRecord = { data: { transactionId: bookingObj.paymentId } };
        } else {
          paymentRecord = await api.processPayment({
            bookingType: type.toUpperCase(),
            bookingId: createdBookingId,
            amount: finalPayableAmount,
            currency: 'INR',
            paymentMethod,
            cardHolder: cardData.cardHolder,
            cardLast4: cardData.cardNumber?.replace(/\s+/g, '').slice(-4) || '4242',
          });
        }
      } catch (err) {
        console.warn('Payment recording note:', err);
      }

      // Success State
      const successPayload = {
        bookingId: createdBookingId,
        referenceCode,
        amount: finalPayableAmount,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount,
        paymentMethod,
        transactionId: bookingObj?.paymentId || paymentRecord?.data?.transactionId || paymentRecord?.payment?.transactionId || `TXN-${Date.now().toString().slice(-8)}`,
        paidAt: new Date().toLocaleString(),
        item,
        formData: activeDetails,
        type,
      };

      setPaymentSuccess(successPayload);
      sessionStorage.removeItem('pendingCheckout');
      localStorage.removeItem('pendingCheckout');

      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      showToast('🎉 Reservation confirmed & payment processed successfully!', 'success');
    } catch (err) {
      console.error('Payment error', err);
      showToast(err.message || 'Payment processing encountered an error.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // If already paid, show Classy Receipt
  if (paymentSuccess) {
    return (
      <div className="container py-5">
        <div className="receipt-card animate-scale-up">
          <div className="receipt-header">
            <div className="receipt-icon-circle">
              <CheckCircle size={48} className="text-success" />
            </div>
            <h2>Payment & Reservation Confirmed!</h2>
            <p className="receipt-sub">
              Your official e-ticket and booking confirmation has been registered in the database.
            </p>
          </div>

          <div className="receipt-grid">
            <div className="receipt-item">
              <span className="lbl">Transaction Reference</span>
              <strong className="val text-highlight">{paymentSuccess.transactionId}</strong>
            </div>
            <div className="receipt-item">
              <span className="lbl">Booking ID</span>
              <strong className="val">{paymentSuccess.bookingId}</strong>
            </div>
            <div className="receipt-item">
              <span className="lbl">Confirmation / PNR Code</span>
              <strong className="val text-success">{paymentSuccess.referenceCode}</strong>
            </div>
            <div className="receipt-item">
              <span className="lbl">Payment Method</span>
              <strong className="val">{paymentSuccess.paymentMethod}</strong>
            </div>
            <div className="receipt-item">
              <span className="lbl">Lead Passenger</span>
              <strong className="val">{paymentSuccess.formData.name}</strong>
            </div>
            <div className="receipt-item">
              <span className="lbl">Total Amount Paid</span>
              <strong className="val text-highlight">₹{paymentSuccess.amount} INR</strong>
            </div>
          </div>

          <div className="receipt-actions">
            <button
              className="btn btn-outline-light"
              onClick={() => window.print()}
            >
              <Download size={16} /> Print / Save E-Ticket
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/my-bookings')}
            >
              <Receipt size={16} /> View in My Bookings &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page container py-4">
      <div className="page-header-banner">
        <div className="header-badge">
          <Lock size={16} /> <span>256-BIT ENCRYPTED CHECKOUT</span>
        </div>
        <h1>Secure Payment Checkout</h1>
        <p>Complete your reservation securely via Credit Card, UPI, or Instant Net Banking.</p>
      </div>

      <div className="checkout-layout-grid">
        {/* Left Column: Payment Form */}
        <div className="payment-form-card">
          <form onSubmit={handlePayNow} className="pm-form-body">
            {/* Traveler Information Section */}
            <div className="traveler-info-section mb-4">
              <div className="section-title-strip mb-3">
                <User size={18} className="text-primary" />
                <h3 className="section-title-sm mb-0">Lead Passenger & Contact Information</h3>
              </div>
              <div className="form-grid-2 mb-3">
                <div className="form-group">
                  <label>Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={passengerDetails.name}
                    onChange={(e) => {
                      setPassengerDetails({ ...passengerDetails, name: e.target.value });
                      setCardData((prev) => ({ ...prev, cardHolder: e.target.value.toUpperCase() || 'VALUED TRAVELER' }));
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address (For e-Ticket Confirmation) *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="rahul@example.com"
                    value={passengerDetails.email}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={passengerDetails.phone}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    className="form-control"
                    value={passengerDetails.age}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    className="form-control"
                    value={passengerDetails.gender}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {type === 'train' && (
                <div className="form-group mt-3">
                  <label>Berth Preference (Indian Railways PRS)</label>
                  <select
                    className="form-control"
                    value={passengerDetails.berthPreference || 'No Preference'}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, berthPreference: e.target.value })}
                  >
                    <option value="No Preference">No Preference (Auto-Allocate)</option>
                    <option value="Lower">Lower Berth</option>
                    <option value="Middle">Middle Berth</option>
                    <option value="Upper">Upper Berth</option>
                    <option value="Side Lower">Side Lower</option>
                    <option value="Side Upper">Side Upper</option>
                    <option value="Window">Window Seat (CC / EC)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Payment Method Tabs */}
            <div className="section-title-strip mb-3">
              <CreditCard size={18} className="text-primary" />
              <h3 className="section-title-sm mb-0">Select Payment Method</h3>
            </div>

            <div className="payment-methods-tabs mb-4">
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <CreditCard size={18} />
                <span>Credit / Debit Card</span>
              </button>
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <Smartphone size={18} />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'NET_BANKING' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('NET_BANKING')}
              >
                <Building2 size={18} />
                <span>Net Banking</span>
              </button>
            </div>
            {paymentMethod === 'CARD' && (
              <div className="card-payment-view">
                {/* Visual Card Component */}
                <div className="visual-credit-card animate-fade-in">
                  <div className="card-chip-strip">
                    <span className="chip-gold"></span>
                    <span className="card-brand-label">TOUR FEVER VIP</span>
                  </div>
                  <div className="card-number-display">{cardData.cardNumber}</div>
                  <div className="card-bottom-row">
                    <div>
                      <span className="sub-lbl">CARDHOLDER</span>
                      <strong className="card-name-txt">{cardData.cardHolder}</strong>
                    </div>
                    <div>
                      <span className="sub-lbl">EXPIRES</span>
                      <strong className="card-expiry-txt">{cardData.expiry}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Fields */}
                <div className="form-group mb-3">
                  <label>Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                    className="form-control"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>

                <div className="form-group mb-3">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardData.cardHolder}
                    onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                    className="form-control"
                    placeholder="Name as printed on card"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input
                      type="text"
                      required
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      className="form-control"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="form-group">
                    <label>Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength="4"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="form-control"
                      placeholder="CVV"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="upi-payment-view animate-fade-in">
                <div className="upi-qr-card">
                  <div className="qr-box">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=tourfever@bank&pn=TourFever&am=${totalPrice}`}
                      alt="UPI QR Code"
                    />
                  </div>
                  <p className="qr-hint">Scan with any UPI App: GPay, PhonePe, Paytm, CRED</p>
                </div>

                <div className="form-group">
                  <label>Or Enter UPI Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="form-control"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'NET_BANKING' && (
              <div className="netbanking-view animate-fade-in">
                <div className="form-group">
                  <label>Select Your Financial Institution</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="form-control"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                  </select>
                </div>
                <div className="bank-notice-pill">
                  You will be safely routed to your bank's 2-Factor Authentication portal upon clicking Pay.
                </div>
              </div>
            )}

            <div className="payment-security-footer">
              <ShieldCheck size={20} className="text-success" />
              <span>Bank-Grade 256-Bit SSL Encryption • PCI-DSS Compliant</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary btn-pay-now"
            >
              {isProcessing ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Processing Payment Transaction...</span>
                </>
              ) : (
                <span>Authorize & Pay ₹{finalPayableAmount.toLocaleString('en-IN')} INR</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="order-summary-sidebar">
          <div className="order-summary-card">
            <h3>Reservation Summary</h3>
            <span className="badge-vertical-pill">{type.toUpperCase()} BOOKING</span>

            <div className="summary-trip-header">
              <h4>
                {type === 'flight' && `${item.airline} (${item.flightNumber})`}
                {type === 'train' && `${item.trainNumber} - ${item.trainName}`}
                {type === 'bus' && item.operatorName}
                {type === 'hotel' && item.name}
                {type === 'package' && item.title}
              </h4>
              <p className="summary-route">
                {type === 'flight' && `${item.fromCity} (${item.fromCode}) → ${item.toCity} (${item.toCode})`}
                {type === 'train' && `${item.fromCity} → ${item.toCity}`}
                {type === 'bus' && `${item.fromCity} → ${item.toCity}`}
                {type === 'hotel' && `${item.location}, ${item.city}`}
                {type === 'package' && item.destination}
              </p>
            </div>

            <div className="summary-specs-list">
              <div className="spec-row">
                <span>Traveler / Guest</span>
                <strong>{passengerDetails.name || 'Valued Traveler'}</strong>
              </div>
              <div className="spec-row">
                <span>Contact Email</span>
                <span>{passengerDetails.email || 'traveler@tourfever.com'}</span>
              </div>
              <div className="spec-row">
                <span>Contact Phone</span>
                <span>{passengerDetails.phone || '+91 9876543210'}</span>
              </div>
              <div className="spec-row">
                <span>Date of Journey</span>
                <strong>{formData.travelDate || formData.checkInDate}</strong>
              </div>
              {selectedClass && (
                <div className="spec-row">
                  <span>Tier / Class</span>
                  <strong className="text-highlight">{selectedClass}</strong>
                </div>
              )}
              {selectedSeats && selectedSeats.length > 0 && (
                <div className="spec-row">
                  <span>Selected Seats</span>
                  <strong className="text-highlight">{selectedSeats.join(', ')}</strong>
                </div>
              )}
            </div>

            {/* Promo Code / Discount Coupons Box */}
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm, 8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                <Tag size={15} color="var(--coral-primary)" />
                <span>Have a Promo Code?</span>
              </div>

              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                      ✓ {appliedCoupon.code} APPLIED
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      You saved ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} on this reservation
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Remove promo code"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME500"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      disabled={couponLoading || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="btn btn-outline-light btn-sm"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {/* Available coupon chips */}
                  {availableCoupons.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={c.description}
                        >
                          <Sparkles size={11} color="var(--coral-primary)" />
                          <strong>{c.code}</strong>
                          <span>({c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="summary-divider" />

            <div className="summary-charges-table">
              <div className="charge-row">
                <span>Base Fare / Unit Rate</span>
                <span>₹{Math.max(1, totalPrice - 35).toLocaleString('en-IN')}</span>
              </div>
              <div className="charge-row">
                <span>Taxes & Concierge Fees</span>
                <span>₹35</span>
              </div>
              {appliedCoupon && (
                <div className="charge-row" style={{ color: '#10b981', fontWeight: 600 }}>
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>- ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="charge-row total-row">
                <strong>Payable Total</strong>
                <strong className="text-highlight">₹{finalPayableAmount.toLocaleString('en-IN')} INR</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
