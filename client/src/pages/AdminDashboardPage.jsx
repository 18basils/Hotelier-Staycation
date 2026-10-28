import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Plus, BedDouble, CalendarCheck, DollarSign, 
  Trash2, ShieldCheck, Star, MapPin, Phone, Users, CheckCircle, Ban 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels', 'rooms', 'bookings'
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
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel and all its associated rooms and bookings?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete hotel');
      }

      loadAllData();
    } catch (err) {
      alert(err.message);
    }
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

      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShieldCheck size={48} className="mx-auto text-amber-600 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 mt-4">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-500 mt-1">Please sign in using administrator credentials to access this control center.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck size={22} />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Administrator Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage properties, add rooms, and monitor all customer reservations
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormError('');
              setHotelModalOpen(true);
            }}
            className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
          >
            <Plus size={16} />
            <span>Add Hotel</span>
          </button>
          <button
            onClick={() => {
              setFormError('');
              setRoomModalOpen(true);
            }}
            className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Plus size={16} />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Hotels</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalHotels}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Building2 size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Rooms</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
              <BedDouble size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Bookings</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalBookings}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <CalendarCheck size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">₹{Number(stats.totalRevenue).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('hotels')}
          className={`pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'hotels'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={16} />
          <span>Hotels Management ({hotels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck size={16} />
          <span>Customer Bookings ({allReservations.length})</span>
        </button>
      </div>

      {/* Tab 1: Hotels List */}
      {activeTab === 'hotels' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Registered Properties</h3>
            <span className="text-xs text-slate-400">{hotels.length} hotels active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Star Rating</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img
                        src={h.image_url}
                        alt={h.name}
                        className="w-12 h-10 object-cover rounded-lg shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{h.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{h.address}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{h.place_name}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded font-bold text-amber-900 bg-amber-100/70 inline-flex items-center gap-1">
                        <Star size={11} className="fill-amber-900" />
                        <span>{h.star_rating} Star</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{h.contact_no}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteHotel(h.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">All Reservations Across System</h3>
            <span className="text-xs text-slate-400">{allReservations.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
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
              <tbody className="divide-y divide-slate-100">
                {allReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-800">
                      {res.booking_code}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{res.guest_name}</p>
                      <p className="text-[11px] text-slate-400">User: @{res.username}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{res.hotel_name}</p>
                      <p className="text-[11px] text-slate-400">Room {res.room_number} ({res.category_name})</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {res.check_in} → {res.check_out}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">
                      ₹{Number(res.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                          res.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : res.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {res.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(res.id, 'CONFIRMED')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {res.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(res.id, 'COMPLETED')}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {res.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(res.id, 'CANCELLED')}
                          className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Add New Hotel Property</h3>

            {formError && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateHotel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination / Place</label>
                <select
                  required
                  value={hotelForm.placeId}
                  onChange={(e) => setHotelForm({ ...hotelForm, placeId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Destination</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}, {p.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hotel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Munnar Valley Resort"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Area, City, Pin Code"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={hotelForm.starRating}
                    onChange={(e) => setHotelForm({ ...hotelForm, starRating: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                    <option value="3">⭐⭐⭐ (3 Star)</option>
                    <option value="2">⭐⭐ (2 Star)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 484 220 0000"
                    value={hotelForm.contactNo}
                    onChange={(e) => setHotelForm({ ...hotelForm, contactNo: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL (Unsplash or web link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={hotelForm.imageUrl}
                  onChange={(e) => setHotelForm({ ...hotelForm, imageUrl: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Highlights of the hotel amenities, views, location..."
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="py-2 px-4 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Add Room to Existing Hotel</h3>

            {formError && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Hotel</label>
                <select
                  required
                  value={roomForm.hotelId}
                  onChange={(e) => setRoomForm({ ...roomForm, hotelId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.place_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Category</label>
                <select
                  required
                  value={roomForm.categoryId}
                  onChange={(e) => setRoomForm({ ...roomForm, categoryId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
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
                <label className="block font-semibold text-slate-700 mb-1">Room Number / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105 or 302B"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nightly Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min="500"
                  placeholder="e.g. 4500"
                  value={roomForm.pricePerNight}
                  onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="py-2 px-4 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
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
