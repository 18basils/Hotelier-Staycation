import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { 
  Building2, MapPin, Phone, Star, Calendar, Wind, Bed, 
  Users, Check, AlertCircle, ArrowLeft, ShieldCheck, Sparkles,
  Wifi, Waves, Coffee, Zap, Dog, Eye, Car, Utensils, MessageSquare,
  ThumbsUp, CheckCircle2, Shield
} from 'lucide-react';

const AMENITY_DETAILS = {
  wifi: { label: 'Free High-Speed Wi-Fi', desc: 'Complimentary fiber Wi-Fi in rooms and public areas', icon: Wifi },
  pool: { label: 'Swimming Pool', desc: 'Temperature-controlled outdoor & infinity pool', icon: Waves },
  spa: { label: 'Ayurvedic Wellness Spa', desc: 'Traditional Kerala Ayurvedic massages and steam baths', icon: Sparkles },
  breakfast: { label: 'Complimentary Breakfast', desc: 'Authentic South Indian & Continental morning buffet', icon: Coffee },
  ev: { label: 'EV Charging Station', desc: 'Dedicated fast electric vehicle charging bays', icon: Zap },
  pet: { label: 'Pet Friendly', desc: 'Welcoming spaces and amenities for furry companions', icon: Dog },
  sea_view: { label: 'Scenic View Balcony', desc: 'Private balconies overlooking backwaters, sea, or tea hills', icon: Eye },
  parking: { label: 'Free Valet Parking', desc: 'Secure 24/7 on-site parking with valet assistance', icon: Car },
  restaurant: { label: 'Multi-Cuisine Dining', desc: 'Signature fine dining and 24/7 room service', icon: Utensils }
};

export default function HotelDetailPage() {
  const { id } = useParams();
  const { user, token, isAuthenticated, openLoginModal } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [isEligibleToReview, setIsEligibleToReview] = useState(false);
  const [eligibleBooking, setEligibleBooking] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

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
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      checkReviewEligibility();
    }
  }, [isAuthenticated, id]);

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

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/hotel/${id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setReviewStats(data.stats || null);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const res = await fetch(`/api/reviews/check-eligible/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setIsEligibleToReview(Boolean(data.eligible));
      setEligibleBooking(data.eligible ? data : null);
    } catch {
      setIsEligibleToReview(false);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: id,
          reservationId: eligibleBooking?.reservationId || null,
          rating: newRating,
          comment: newComment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewSuccess('Your verified review was published successfully!');
      setNewComment('');
      setShowReviewForm(false);
      setIsEligibleToReview(false);
      fetchReviews();
      fetchHotelDetails();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
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

  const amenitiesList = hotel.amenities || ['wifi', 'pool', 'spa', 'breakfast', 'parking', 'restaurant'];
  const avgScore = reviewStats?.averageRating || hotel.average_rating || hotel.star_rating;
  const totalReviewsCount = reviewStats?.totalReviews || reviews.length || hotel.review_count || 12;

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
                  <span>{hotel.star_rating} Star Luxury</span>
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
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Guest Rating</span>
                <p className="text-xl font-extrabold text-emerald-400 leading-tight flex items-center justify-end gap-1">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                  <span>{avgScore} / 5</span>
                </p>
                <span className="text-[10px] text-slate-300">{totalReviewsCount} Verified Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Gallery & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100">
            <img
              src={hotel.image_url}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">About This Property</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {hotel.description || 'Welcome to a world of pristine luxury and renowned Kerala hospitality. Enjoy personalized services, scenic nature views, and modern comforts.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Verified Cleanliness & Safety Standards</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles size={16} className="text-emerald-600 shrink-0" />
                <span>24/7 Front Desk & Concierge Assistance</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Instant Confirmation with QR Code Voucher</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Nightly Tariffs From</span>
              <p className="text-2xl font-black text-emerald-700">
                ₹{Number(hotel.min_price || 2500).toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">/ night</span>
              </p>
            </div>
          </div>
        </div>

        {/* Property Amenities Grid */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              <span>Property Amenities & Services</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Everything provided on-site to make your stay effortless and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {amenitiesList.map((key) => {
              const details = AMENITY_DETAILS[key] || { label: key, desc: 'Verified property amenity', icon: Check };
              const Icon = details.icon;
              return (
                <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{details.label}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{details.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Selector & Room Availability Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Check Availability & Choose Your Room</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your check-in and check-out dates to view available rooms in real-time.
            </p>
          </div>

          {/* Date Picker Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-emerald-600" />
                <span>Check-In Date</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-emerald-600" />
                <span>Check-Out Date</span>
              </label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Wind size={13} className="text-emerald-600" />
                <span>Climate</span>
              </label>
              <select
                value={acFilter}
                onChange={(e) => setAcFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 cursor-pointer"
              >
                <option value="">All (AC & Non-AC)</option>
                <option value="ac">Air Conditioned (AC)</option>
                <option value="nonac">Non-AC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Bed size={13} className="text-emerald-600" />
                <span>Bed Capacity</span>
              </label>
              <select
                value={bedsFilter}
                onChange={(e) => setBedsFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 cursor-pointer"
              >
                <option value="">Any Beds</option>
                <option value="1">1 Bed (Single)</option>
                <option value="2">2 Beds (Double)</option>
                <option value="3">3+ Beds (Family Suite)</option>
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">
                Found {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} for {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600">
                <AlertCircle size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold">No rooms match your date and amenity filters.</p>
                <p className="text-[11px] text-slate-400 mt-1">Try expanding your check-in dates or resetting the AC/bed filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rooms.map((room) => {
                  const roomTotal = room.price_per_night * nights;

                  return (
                    <div
                      key={room.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        room.is_available
                          ? 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md'
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{room.category_name}</h4>
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Room {room.room_number}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 flex items-center gap-1">
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

        {/* Verified Guest Reviews & Ratings Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={20} className="text-emerald-600" />
                <span>Verified Guest Reviews & Ratings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic feedback left by guests who have booked and stayed at {hotel.name}.
              </p>
            </div>

            {isEligibleToReview ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="py-2 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all self-start sm:self-auto flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>{showReviewForm ? 'Close Form' : 'Write a Verified Review'}</span>
              </button>
            ) : isAuthenticated ? (
              <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto flex items-center gap-1">
                <Shield size={13} className="text-emerald-600" />
                <span>Verified Stay required to post reviews</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="text-xs font-semibold text-emerald-600 hover:underline self-start sm:self-auto"
              >
                Sign in to review
              </button>
            )}
          </div>

          {reviewSuccess && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{reviewSuccess}</span>
            </div>
          )}

          {/* Write Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950">Share Your Experience</h4>
                <span className="text-[10px] text-emerald-700 font-mono">Booking Ref: {eligibleBooking?.bookingCode}</span>
              </div>

              {reviewError && (
                <p className="text-xs text-rose-600">{reviewError}</p>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating:</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        className={
                          star <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{newRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review Comment:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell future guests about your stay, room comfort, hospitality, dining, or amenities..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || newComment.trim().length < 5}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          )}

          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 items-center">
            <div className="text-center sm:text-left sm:border-r border-slate-200/80 sm:pr-6">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overall Guest Score</span>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-4xl font-black text-slate-900">{avgScore}</span>
                <div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Based on {totalReviewsCount} reviews</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-500">5 Star</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="w-8 text-slate-400 text-right">85%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-500">4 Star</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="w-8 text-slate-400 text-right">12%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-500">3 Star</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '3%' }}></div>
                </div>
                <span className="w-8 text-slate-400 text-right">3%</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No reviews yet for this hotel.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {(rev.user_full_name || rev.username || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {rev.user_full_name || rev.username || 'Verified Guest'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                          <ShieldCheck size={11} />
                          <span>Verified Stay</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-10">
                    "{rev.comment}"
                  </p>

                  <div className="pl-10 text-[10px] text-slate-400">
                    Stayed in {hotel.name} • {new Date(rev.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))
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
            checkReviewEligibility();
          }}
        />
      )}
    </div>
  );
}
