import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Building2, Plus, BedDouble, CalendarCheck, DollarSign, 
  Trash2, ShieldCheck, Star, MapPin, Phone, Users, CheckCircle, Ban 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token, isAdmin } = useAuth();
  const { toast, confirmDialog } = useToast();

  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels', 'bookings'
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Hotel Form State
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    placeId: '',
    name: '',
    address: '',
    starRating: '4',
    contactNo: '',
    description: '',
    imageUrl: '',
    featured: false
  });

  // Add Room Form State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    hotelId: '',
    categoryId: '',
    roomNumber: '',
    pricePerNight: ''
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // 2. Fetch Hotels
      const hotelsRes = await fetch('/api/hotels');
      const hotelsData = await hotelsRes.json();
      setHotels(hotelsData.hotels || []);

      // 3. Fetch Places
      const placesRes = await fetch('/api/hotels/places');
      const placesData = await placesRes.json();
      setPlaces(placesData.places || []);

      // 4. Fetch Categories
      const catRes = await fetch('/api/rooms/categories');
      const catData = await catRes.json();
      setCategories(catData.categories || []);

      // 5. Fetch All Reservations
      const resRes = await fetch('/api/admin/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await resRes.json();
      setAllReservations(resData.reservations || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create hotel');

      toast.success('Hotel property created successfully!');
      setFormSuccess('Hotel created successfully!');
      setHotelModalOpen(false);
      setHotelForm({
        placeId: '',
        name: '',
        address: '',
        starRating: '4',
        contactNo: '',
        description: '',
        imageUrl: '',
        featured: false
      });
      loadAllData();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteHotel = (hotelId, hotelName) => {
    confirmDialog({
      title: 'Delete Hotel Property?',
      message: `Are you sure you want to delete "${hotelName || 'this hotel'}" and all its associated rooms and bookings? This action cannot be reversed.`,
      confirmText: 'Yes, Delete Property',
      cancelText: 'Keep Hotel',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete hotel');
          }

          toast.success('Property removed from system');
          loadAllData();
        } catch (err) {
          toast.error(err.message || 'Failed to delete hotel');
        }
      }
    });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roomForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add room');

      toast.success('Room unit added successfully!');
      setFormSuccess('Room added successfully!');
      setRoomModalOpen(false);
      setRoomForm({
        hotelId: '',
        categoryId: '',
        roomNumber: '',
        pricePerNight: ''
      });
      loadAllData();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleUpdateBookingStatus = async (resId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update reservation status');
      }

      toast.success(`Booking status updated to ${newStatus}`);
      loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShieldCheck size={48} className="mx-auto text-amber-600 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please sign in using administrator credentials to access this control center.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <ShieldCheck size={22} />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Administrator Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage properties, add rooms, and monitor all customer reservations
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormError('');
              setHotelModalOpen(true);
            }}
            className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
          >
            <Plus size={16} />
            <span>Add Hotel</span>
          </button>
          <button
            onClick={() => {
              setFormError('');
              setRoomModalOpen(true);
            }}
            className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <Plus size={16} />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Hotels</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalHotels}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-2xl">
              <Building2 size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Rooms</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-2xl">
              <BedDouble size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Bookings</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalBookings}</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-2xl">
              <CalendarCheck size={24} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{Number(stats.totalRevenue).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('hotels')}
          className={`pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'hotels'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Building2 size={16} />
          <span>Hotels Management ({hotels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <CalendarCheck size={16} />
          <span>Customer Bookings ({allReservations.length})</span>
        </button>
      </div>

      {/* Tab 1: Hotels List */}
      {activeTab === 'hotels' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Properties</h3>
            <span className="text-xs text-slate-400">{hotels.length} hotels active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Star Rating</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img
                        src={h.image_url}
                        alt={h.name}
                        className="w-12 h-10 object-cover rounded-xl shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{h.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{h.address}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">{h.place_name}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded font-bold text-amber-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-950/60 inline-flex items-center gap-1">
                        <Star size={11} className="fill-amber-900 dark:fill-amber-300" />
                        <span>{h.star_rating} Star</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">{h.contact_no}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteHotel(h.id, h.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings List */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Reservations Across System</h3>
            <span className="text-xs text-slate-400">{allReservations.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Booking Code</th>
                  <th className="px-5 py-3">Guest & User</th>
                  <th className="px-5 py-3">Hotel & Room</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {res.booking_code}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{res.guest_name}</p>
                      <p className="text-[11px] text-slate-400">User: @{res.username}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{res.hotel_name}</p>
                      <p className="text-[11px] text-slate-400">Room {res.room_number} ({res.category_name})</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {res.check_in} → {res.check_out}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">
                      ₹{Number(res.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                          res.status === 'CONFIRMED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : res.status === 'COMPLETED'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {res.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(res.id, 'CONFIRMED')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {res.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(res.id, 'COMPLETED')}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {res.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(res.id, 'CANCELLED')}
                          className="px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Hotel */}
      {hotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Hotel Property</h3>

            {formError && (
              <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateHotel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination / Place</label>
                <select
                  required
                  value={hotelForm.placeId}
                  onChange={(e) => setHotelForm({ ...hotelForm, placeId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select Destination</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}, {p.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hotel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Munnar Valley Resort"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Area, City, Pin Code"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={hotelForm.starRating}
                    onChange={(e) => setHotelForm({ ...hotelForm, starRating: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                    <option value="3">⭐⭐⭐ (3 Star)</option>
                    <option value="2">⭐⭐ (2 Star)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 484 220 0000"
                    value={hotelForm.contactNo}
                    onChange={(e) => setHotelForm({ ...hotelForm, contactNo: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Image URL (Unsplash or web link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={hotelForm.imageUrl}
                  onChange={(e) => setHotelForm({ ...hotelForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Highlights of the hotel amenities, views, location..."
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="py-2 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow"
                >
                  Save Hotel Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Room */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Room to Existing Hotel</h3>

            {formError && (
              <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Hotel</label>
                <select
                  required
                  value={roomForm.hotelId}
                  onChange={(e) => setRoomForm({ ...roomForm, hotelId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.place_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Category</label>
                <select
                  required
                  value={roomForm.categoryId}
                  onChange={(e) => setRoomForm({ ...roomForm, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ac === 'ac' ? 'AC' : 'Non-AC'}, {c.beds} Beds)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Number / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105 or 302B"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nightly Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min="500"
                  placeholder="e.g. 4500"
                  value={roomForm.pricePerNight}
                  onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="py-2 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow"
                >
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
