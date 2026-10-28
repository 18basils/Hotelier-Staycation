import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Calendar, MapPin, Building2, Phone, AlertCircle, Ban, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MyBookingsPage() {
  const { user, token, isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'CONFIRMED', 'CANCELLED'
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    fetchMyBookings();
  }, [isAuthenticated]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err) {
      console.error('Failed to load user reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel reservation');
      }

      setCancelModalBooking(null);
      fetchMyBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <CalendarCheck size={48} className="mx-auto text-emerald-600 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 mt-4">Sign in to view your bookings</h2>
        <p className="text-xs text-slate-500 mt-1">Access your reservation history, download receipts, and manage bookings.</p>
        <button
          onClick={openLoginModal}
          className="mt-6 py-2.5 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck size={24} className="text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900">My Bookings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your hotel reservations and view upcoming check-in dates
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'CONFIRMED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmed ({reservations.filter((r) => r.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'CANCELLED' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({reservations.filter((r) => r.status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto space-y-4 shadow-sm">
          <Building2 size={44} className="mx-auto text-slate-300 stroke-1" />
          <h3 className="text-base font-bold text-slate-800">No reservations found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {statusFilter === 'ALL'
              ? "You haven't made any hotel reservations yet. Explore our curated properties to plan your next trip!"
              : `No ${statusFilter.toLowerCase()} reservations in your account.`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 py-2.5 px-5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
          >
            <span>Explore Hotels</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => {
            const isConfirmed = res.status === 'CONFIRMED';
            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row"
              >
                {/* Hotel Thumbnail */}
                <div className="md:w-56 h-40 md:h-auto bg-slate-100 shrink-0 relative">
                  <img
                    src={res.hotel_image}
                    alt={res.hotel_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md backdrop-blur-md shadow-xs ${
                        isConfirmed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        REF: {res.booking_code}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Booked on {new Date(res.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {res.hotel_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span>{res.hotel_address}</span>
                    </p>
                  </div>

                  {/* Dates & Room Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Room</span>
                      <p className="font-bold text-slate-800">
                        Room {res.room_number} <span className="font-normal text-slate-500">({res.category_name})</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Stay Dates</span>
                      <p className="font-bold text-slate-800">
                        {res.check_in} → {res.check_out}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Paid</span>
                      <p className="font-extrabold text-emerald-700 text-sm">
                        ₹{Number(res.total_price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-500">
                      Guest: <span className="font-semibold text-slate-700">{res.guest_name}</span>
                    </p>

                    {isConfirmed && (
                      <button
                        onClick={() => setCancelModalBooking(res)}
                        className="py-1.5 px-3.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Ban size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel this reservation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel booking <span className="font-mono font-bold text-slate-700">{cancelModalBooking.booking_code}</span> for {cancelModalBooking.hotel_name}?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId === cancelModalBooking.id}
                onClick={() => handleCancelBooking(cancelModalBooking.id)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors disabled:opacity-50"
              >
                {cancellingId === cancelModalBooking.id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
