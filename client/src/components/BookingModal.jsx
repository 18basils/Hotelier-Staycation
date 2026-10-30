import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { bookingSchema } from '../schemas/bookingSchemas';
import { 
  X, Calendar, User, Phone, CheckCircle2, ShieldAlert, Sparkles, 
  Building2, Bed, Wind, Tag, CreditCard, Smartphone, Check, Lock, ArrowRight, RotateCcw
} from 'lucide-react';

const QUICK_COUPONS = ['WELCOME20', 'MONSOON15', 'FLAT500'];

export default function BookingModal({ room, hotel, checkIn, checkOut, nights, onClose, onSuccess }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Booking Flow Steps: 1 = Details & Pricing, 2 = Payment Gateway
  const [step, setStep] = useState(1);

  // Form Fields
  const [guestName, setGuestName] = useState(user?.fullName || user?.username || '');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Promo Code State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('guest@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // Loading & Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Price Calculations
  const diffDays = Number(nights) || 1;
  const baseFare = diffDays * room.price_per_night;
  const taxAmount = Math.round(baseFare * 0.12); // 12% Hospitality GST
  const serviceFee = 199;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, baseFare + taxAmount + serviceFee - discountAmount);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          bookingAmount: baseFare
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply coupon');
      }

      setAppliedCoupon(data);
      setCouponInput(code);
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError('');

    const validationResult = bookingSchema.safeParse({
      guestName,
      guestEmail: user?.email || 'guest@hotelier.in',
      guestPhone: guestContact,
      checkIn,
      checkOut,
      specialRequests: specialRequests || ''
    });

    if (!validationResult.success) {
      setError(validationResult.error.errors?.[0]?.message || 'Please check reservation details');
      return;
    }

    setStep(2);
  };

  const handleFinalBookingAndPayment = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        roomId: room.id,
        checkIn,
        checkOut,
        guestName,
        guestContact,
        specialRequests,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod: paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod === 'card' ? `Card (ending ${cardNumber.slice(-4)})` : 'Net Banking (HDFC)'
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking');
      }

      setConfirmedBooking(data.reservation);
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      if (onSuccess) onSuccess(data.reservation);
    } catch (err) {
      setError(err.message);
      setStep(1); // Return to review on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {confirmedBooking 
                ? 'Reservation Confirmed! 🎉' 
                : step === 1 ? 'Booking Details & Pricing' : 'Secure Payment Checkout'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {confirmedBooking ? 'Your payment was verified & booking secured' : `${hotel.name} • Room ${room.room_number}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {confirmedBooking ? (
            // ================= Success State =================
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Booking Confirmed!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We look forward to welcoming you at {hotel.name}
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Booking Reference:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{confirmedBooking.booking_code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{confirmedBooking.transaction_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    PAID & VERIFIED
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Check-in / Check-out:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{checkIn} to {checkOut} ({diffDays} nights)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Total Paid:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                    ₹{Number(confirmedBooking.total_price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/my-bookings');
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
                >
                  View in My Bookings & Print Voucher
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            // ================= STEP 1: Guest Details & Dynamic Pricing =================
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Room Quick Specs */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-950 dark:text-emerald-200">{room.category_name}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">{room.ac === 'ac' ? 'Air Conditioned' : 'Non-AC'} • {room.beds} Bed(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">₹{room.price_per_night.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">per night</p>
                </div>
              </div>

              {/* Guest Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Guest Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Menon"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={guestContact}
                      onChange={(e) => setGuestContact(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quiet room, late check-in after 7 PM, high floor..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              {/* Promo Code Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Apply Promo Code:</span>
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                    >
                      Remove ({appliedCoupon.code})
                    </button>
                  )}
                </label>

                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Code {appliedCoupon.code} Applied!</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">{appliedCoupon.description}</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg">
                      -₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code (e.g. WELCOME20)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        disabled={couponLoading || !couponInput.trim()}
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{couponError}</p>
                    )}

                    {/* Quick Suggestion Pills */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Codes:</span>
                      {QUICK_COUPONS.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleApplyCoupon(code)}
                          className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-800 rounded-md border border-slate-200/60 dark:border-slate-700 transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Price Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Base Rate ({diffDays} night{diffDays > 1 ? 's' : ''} × ₹{room.price_per_night.toLocaleString('en-IN')})</span>
                  <span>₹{baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Hospitality GST & Taxes (12%)</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Platform & Service Fee</span>
                  <span>₹{serviceFee}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span className="font-extrabold text-sm">Total Payable:</span>
                  <span className="font-black text-lg text-emerald-700 dark:text-emerald-400">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          ) : (
            // ================= STEP 2: Payment Gateway (Razorpay/Stripe Simulation) =================
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/70 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Lock size={14} className="text-amber-700 dark:text-amber-400" />
                  <span>Razorpay Test Gateway Mode (Safe Simulation)</span>
                </span>
                <span className="font-black text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-3 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Smartphone size={16} className={paymentMethod === 'upi' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                  <span>UPI Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-3 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <CreditCard size={16} className={paymentMethod === 'card' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2 px-3 rounded-xl font-semibold border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Building2 size={16} className={paymentMethod === 'netbanking' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Payment Method Subform */}
              {paymentMethod === 'upi' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enter UPI ID (Google Pay / PhonePe / Paytm)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    A test approval prompt will be simulated automatically upon submission.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Card Number (Test Mode)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Select Bank:</label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100">
                    <option>HDFC Bank (Instant Verification)</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinalBookingAndPayment}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {loading ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Pay ₹{totalAmount.toLocaleString('en-IN')} & Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
