import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, User, Phone, CheckCircle2, ShieldAlert, Sparkles, Building2, Bed, Wind } from 'lucide-react';

export default function BookingModal({ room, hotel, checkIn, checkOut, nights, onClose, onSuccess }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [guestName, setGuestName] = useState(user?.fullName || user?.username || '');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const totalPrice = (nights || 1) * room.price_per_night;

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: room.id,
          checkIn,
          checkOut,
          guestName,
          guestContact,
          specialRequests
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete reservation');
      }

      setConfirmedBooking(data.reservation);
      if (onSuccess) onSuccess(data.reservation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {confirmedBooking ? 'Reservation Confirmed! 🎉' : 'Confirm Your Booking'}
            </h2>
            <p className="text-xs text-slate-500">
              {confirmedBooking ? 'Your room has been reserved successfully' : `${hotel.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {confirmedBooking ? (
          // Success State
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200 mb-2">
                BOOKING REF: {confirmedBooking.bookingCode}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Thank you for booking with us!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                A confirmation has been saved to your account. You can view or cancel this booking anytime from My Bookings.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Hotel:</span>
                <span className="font-semibold text-slate-900">{hotel.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Room:</span>
                <span className="font-semibold text-slate-900">Room {room.room_number} ({room.category_name})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dates:</span>
                <span className="font-semibold text-slate-900">{checkIn} to {checkOut} ({nights} nights)</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total Price:</span>
                <span className="font-bold text-emerald-700 text-sm">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/my-bookings');
                }}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
              >
                Go to My Bookings
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        ) : (
          // Booking Form
          <form onSubmit={handleBooking} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Room Summary Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Room {room.room_number}</h4>
                  <p className="text-xs text-slate-500">{room.category_name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`px-2 py-0.5 rounded font-semibold ${room.ac === 'ac' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                    {room.ac === 'ac' ? 'AC' : 'Non-AC'}
                  </span>
                  <span className="px-2 py-0.5 rounded font-semibold bg-slate-200/70 text-slate-700">
                    {room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-600" />
                  <span>{checkIn} → {checkOut} ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Total: </span>
                  <span className="text-sm font-extrabold text-emerald-700">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Guest Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Guest Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quiet room, late check-in, ground floor"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Confirm Reservation (₹{totalPrice.toLocaleString('en-IN')})</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
