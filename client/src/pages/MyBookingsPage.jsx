import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  CalendarCheck, Calendar, MapPin, Building2, Phone, AlertCircle, Ban, 
  CheckCircle2, ArrowRight, Printer, Download, Star, QrCode, ShieldCheck, X
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user, token, isAuthenticated, openLoginModal } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [invoiceModalBooking, setInvoiceModalBooking] = useState(null);

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
      toast.error('Failed to load reservations');
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

      toast.success('Reservation cancelled & full refund initiated!');
      setCancelModalBooking(null);
      fetchMyBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCompleteStay = async (id) => {
    try {
      const res = await fetch(`/api/reservations/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete stay');
      }

      toast.success('Stay marked as completed! You can now post a verified review.');
      fetchMyBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to update stay status');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <CalendarCheck size={48} className="mx-auto text-emerald-600 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Sign in to view your bookings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access your reservation history, download receipts, and manage bookings.</p>
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
            <CalendarCheck size={24} className="text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Bookings & Invoices</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your hotel reservations, download official PDF vouchers, and review completed stays
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700 text-xs flex-wrap gap-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'CONFIRMED' 
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Confirmed ({reservations.filter((r) => r.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'COMPLETED' 
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed ({reservations.filter((r) => r.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'CANCELLED' 
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            <div key={i} className="h-44 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 max-w-lg mx-auto space-y-4 shadow-sm">
          <Building2 size={44} className="mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No reservations found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
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
            const isCompleted = res.status === 'COMPLETED';
            const isCancelled = res.status === 'CANCELLED';

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row"
              >
                {/* Hotel Thumbnail */}
                <div className="md:w-56 h-48 md:h-auto bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                  <img
                    src={res.hotel_image}
                    alt={res.hotel_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md backdrop-blur-md shadow-xs ${
                        isConfirmed
                          ? 'bg-emerald-600 text-white'
                          : isCompleted
                          ? 'bg-blue-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  {res.payment_status && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-md shadow-xs ${
                        res.payment_status === 'PAID' ? 'bg-slate-900/85 text-emerald-400' : 'bg-slate-900/85 text-rose-400'
                      }`}>
                        {res.payment_status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Booking Information */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700">
                        VOUCHER: {res.booking_code}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Booked on {new Date(res.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                      {res.hotel_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span>{res.hotel_address}</span>
                    </p>
                  </div>

                  {/* Dates & Room Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs border border-slate-100 dark:border-slate-750">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Room</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Room {res.room_number} <span className="font-normal text-slate-500">({res.category_name})</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Stay Duration</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {res.total_nights || 1} Night{res.total_nights > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Dates</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {res.check_in} → {res.check_out}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">Total Paid</span>
                      <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                        ₹{Number(res.total_price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Primary Guest: <span className="font-semibold text-slate-800 dark:text-slate-200">{res.guest_name}</span>
                    </p>

                    <div className="flex items-center gap-2">
                      {/* Download PDF / Print Voucher Button */}
                      <button
                        type="button"
                        onClick={() => setInvoiceModalBooking(res)}
                        className="py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Printer size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Download Invoice (PDF)</span>
                      </button>

                      {/* Review Button */}
                      {(isConfirmed || isCompleted) && (
                        <Link
                          to={`/hotel/${res.hotel_id}`}
                          className="py-1.5 px-3 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Star size={13} className="fill-amber-500 text-amber-500" />
                          <span>Review Hotel</span>
                        </Link>
                      )}

                      {/* Simulate stay complete for verified review flow */}
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleCompleteStay(res.id)}
                          className="py-1.5 px-2.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                          title="Click to simulate checkout and unlock verified review submission"
                        >
                          Simulate Check-Out
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => setCancelModalBooking(res)}
                          className="py-1.5 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Tax Invoice & Check-In Voucher Modal (Print-Ready PDF) */}
      {invoiceModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[92vh] space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Official Hotel Voucher & Tax Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="py-1.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalBooking(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Voucher Document */}
            <div className="space-y-6 printable-voucher text-slate-800 dark:text-slate-200">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">Hotelier</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Staycation & Resorts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Official Guest Confirmation Voucher & GST Tax Invoice</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">GSTIN: 32AABCH1082K1Z8 • Reg No: KRL-HTL-2026-992</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 block">VOUCHER CODE</span>
                  <span className="text-xl font-mono font-black text-slate-900 dark:text-white">{invoiceModalBooking.booking_code}</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {invoiceModalBooking.payment_status || 'PAID & CONFIRMED'}
                  </span>
                </div>
              </div>

              {/* QR Code & Stay Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 items-center">
                <div className="text-center sm:text-left sm:border-r border-slate-200 dark:border-slate-700 sm:pr-4 flex flex-col items-center sm:items-start">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                      `HOTELIER-STAY:${invoiceModalBooking.booking_code}|GUEST:${invoiceModalBooking.guest_name}|HOTEL:${invoiceModalBooking.hotel_name}`
                    )}`}
                    alt="Check-in QR Code"
                    className="w-28 h-28 rounded-xl border border-slate-200 dark:border-slate-600 p-1 bg-white shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold mt-1">Scan at Hotel Reception</span>
                </div>

                <div className="sm:col-span-2 space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{invoiceModalBooking.hotel_name}</h4>
                  <p className="text-slate-600 dark:text-slate-300">{invoiceModalBooking.hotel_address}</p>
                  <p className="text-slate-600 dark:text-slate-300">Front Desk: {invoiceModalBooking.hotel_contact || '+91 484 266 1234'}</p>
                  <div className="pt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span>Check-in: <strong className="text-emerald-800 dark:text-emerald-400">{invoiceModalBooking.check_in}</strong> (12:00 PM)</span>
                    <span>Check-out: <strong className="text-emerald-800 dark:text-emerald-400">{invoiceModalBooking.check_out}</strong> (11:00 AM)</span>
                  </div>
                </div>
              </div>

              {/* Guest & Transaction Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Primary Guest</span>
                  <p className="font-bold text-slate-900 dark:text-white">{invoiceModalBooking.guest_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{invoiceModalBooking.guest_contact || '+91 98765 43210'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Room Allocated</span>
                  <p className="font-bold text-slate-900 dark:text-white">Room {invoiceModalBooking.room_number}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{invoiceModalBooking.category_name} ({invoiceModalBooking.ac === 'ac' ? 'AC' : 'Non-AC'})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold block">Payment Method</span>
                  <p className="font-bold text-slate-900 dark:text-white">{invoiceModalBooking.payment_method || 'UPI Instant'}</p>
                  <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{invoiceModalBooking.transaction_id || 'PAY-RZP-928174'}</p>
                </div>
              </div>

              {/* Tax Invoice Itemization Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Itemized Tariff & Tax Charges</span>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-center">Nights</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-2.5">Room Tariff ({invoiceModalBooking.category_name})</td>
                        <td className="p-2.5 text-center">{invoiceModalBooking.total_nights || 1}</td>
                        <td className="p-2.5 text-right font-medium">
                          ₹{Number(invoiceModalBooking.base_fare || invoiceModalBooking.total_price * 0.88).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Hospitality GST (12% CGST + SGST)</td>
                        <td className="p-2.5 text-center">—</td>
                        <td className="p-2.5 text-right font-medium">
                          ₹{Number(invoiceModalBooking.tax_amount || Math.round(invoiceModalBooking.total_price * 0.10)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Platform Convenience & Security Fee</td>
                        <td className="p-2.5 text-center">—</td>
                        <td className="p-2.5 text-right font-medium">₹{invoiceModalBooking.service_fee || 199}</td>
                      </tr>
                      {invoiceModalBooking.discount_amount > 0 && (
                        <tr className="text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <td className="p-2.5">Promo Discount ({invoiceModalBooking.coupon_code || 'SPECIAL'})</td>
                          <td className="p-2.5 text-center">—</td>
                          <td className="p-2.5 text-right font-bold">
                            -₹{Number(invoiceModalBooking.discount_amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50/80 dark:bg-slate-800/80 font-black text-slate-900 dark:text-white text-sm">
                        <td className="p-3" colSpan={2}>Grand Total Paid</td>
                        <td className="p-3 text-right text-emerald-800 dark:text-emerald-400">
                          ₹{Number(invoiceModalBooking.total_price).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms & Reception Instructions */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">Check-in Guidelines:</p>
                <p>1. Present this digital voucher or printed copy alongside a valid Government-issued photo ID (Aadhaar, Passport, or Driving License).</p>
                <p>2. Standard hotel check-in time is 12:00 PM; check-out is 11:00 AM. Early check-in is subject to room availability.</p>
                <p>3. This invoice acts as an official electronic receipt. Need assistance? Contact Hotelier Concierge at support@hotelierstays.com.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Ban size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cancel this reservation?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to cancel booking <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cancelModalBooking.booking_code}</span>? A full refund of ₹{Number(cancelModalBooking.total_price).toLocaleString('en-IN')} will be initiated to your payment source.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId === cancelModalBooking.id}
                onClick={() => handleCancelBooking(cancelModalBooking.id)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors disabled:opacity-50"
              >
                {cancellingId === cancelModalBooking.id ? 'Processing...' : 'Yes, Cancel & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
