import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { 
  Building2, MapPin, Phone, Star, Calendar, Wind, Bed, 
  Users, Check, AlertCircle, ArrowLeft, ShieldCheck, Sparkles 
} from 'lucide-react';

export default function HotelDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, openLoginModal } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default dates: check-in today, check-out in 2 days
  const todayStr = new Date().toISOString().split('T')[0];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(nextDateStr);
  const [acFilter, setAcFilter] = useState('');
  const [bedsFilter, setBedsFilter] = useState('');

  // Booking Modal State
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  // Compute nights
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (id) fetchRooms();
  }, [id, checkIn, checkOut, acFilter, bedsFilter]);

  const fetchHotelDetails = async () => {
    try {
      const res = await fetch(`/api/hotels/${id}`);
      const data = await res.json();
      setHotel(data.hotel);
    } catch (err) {
      console.error('Failed to load hotel details:', err);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      if (acFilter) params.append('ac', acFilter);
      if (bedsFilter) params.append('beds', bedsFilter);

      const res = await fetch(`/api/rooms/hotel/${id}?${params.toString()}`);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (room) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setSelectedRoomForBooking(room);
  };

  if (!hotel && loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Hotel not found</h2>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-emerald-600 hover:underline">
          ← Back to hotel listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Top Banner / Hero */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Hotels</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold text-amber-900 bg-amber-400 rounded-lg flex items-center gap-1">
                  <Star size={12} className="fill-amber-900" />
                  <span>{hotel.star_rating} Star</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">in {hotel.place_name}, {hotel.place_state}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1.5">{hotel.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{hotel.address}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{hotel.contact_no}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Starting Price</span>
                <p className="text-xl font-extrabold text-emerald-400 leading-tight">
                  ₹{Number(hotel.min_price || 2500).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-300">/ night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Photo & Description */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
            <img
              src={hotel.image_url}
              alt={hotel.name}
              className="w-full h-64 sm:h-72 object-cover"
            />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">About this Property</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hotel.description || 'Welcome to this exceptional stay offering warm hospitality, scenic views, and quality accommodation.'}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Instant Confirmation & Flexible Cancellation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>Verified Clean & Hygienic Stay</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span>24/7 Front Desk Assistance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Room Booking Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Picker & Filters Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" />
                <span>Select Dates & Check Room Availability</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                {nights} {nights === 1 ? 'Night' : 'Nights'} Stay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Filter Tabs (AC / Beds) */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">AC:</span>
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/70">
                  <button
                    onClick={() => setAcFilter('')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      acFilter === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAcFilter('ac')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      acFilter === 'ac' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    AC Only
                  </button>
                  <button
                    onClick={() => setAcFilter('nonac')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      acFilter === 'nonac' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Non-AC
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Beds:</span>
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/70">
                  <button
                    onClick={() => setBedsFilter('')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      bedsFilter === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Any
                  </button>
                  <button
                    onClick={() => setBedsFilter('1')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      bedsFilter === '1' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1 Bed
                  </button>
                  <button
                    onClick={() => setBedsFilter('2')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      bedsFilter === '2' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2 Beds
                  </button>
                  <button
                    onClick={() => setBedsFilter('3')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      bedsFilter === '3' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3+ Beds
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Room Listings */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Available Rooms ({rooms.length})
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-200/70 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500">No rooms match the selected filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => {
                  const roomTotal = nights * room.price_per_night;
                  return (
                    <div
                      key={room.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        room.is_available
                          ? 'border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200'
                          : 'border-slate-200 bg-slate-50/70 opacity-70'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-bold text-slate-800 bg-slate-100 rounded-md">
                            Room {room.room_number}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900">{room.category_name}</h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                              room.ac === 'ac' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <Wind size={12} />
                            <span>{room.ac === 'ac' ? 'Air Conditioned' : 'Non-AC'}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                            <Bed size={12} />
                            <span>{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                            <Users size={12} />
                            <span>Up to {room.capacity} Guests</span>
                          </span>
                        </div>

                        {room.category_description && (
                          <p className="text-xs text-slate-500 max-w-md">{room.category_description}</p>
                        )}
                      </div>

                      {/* Pricing & Booking Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-slate-900">
                              ₹{Number(room.price_per_night).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">/ night</span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700">
                            ₹{roomTotal.toLocaleString('en-IN')} for {nights} {nights === 1 ? 'night' : 'nights'}
                          </span>
                        </div>

                        {room.is_available ? (
                          <button
                            onClick={() => handleBookClick(room)}
                            className="py-2 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow transition-all"
                          >
                            Book Room
                          </button>
                        ) : (
                          <span className="py-1.5 px-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                            Already Booked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          onClose={() => setSelectedRoomForBooking(null)}
          onSuccess={() => {
            fetchRooms(); // refresh availability
          }}
        />
      )}
    </div>
  );
}
