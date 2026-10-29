import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import BookingModal from '../components/BookingModal';
import ImageLightbox from '../components/ImageLightbox';
import HotelMap from '../components/HotelMap';
import { 
  Building2, MapPin, Phone, Star, Calendar, Wind, Bed, 
  Users, Check, AlertCircle, ArrowLeft, ShieldCheck, Sparkles,
  Wifi, Waves, Coffee, Zap, Dog, Eye, Car, Utensils, MessageSquare,
  ThumbsUp, CheckCircle2, Shield, Heart, Share2, Compass, ExternalLink,
  Images, Camera
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
  const [searchParams] = useSearchParams();
  const { user, token, isAuthenticated, openLoginModal } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review Form State
  const [isEligibleToReview, setIsEligibleToReview] = useState(false);
  const [eligibleBooking, setEligibleBooking] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Default dates: URL param or check-in today, check-out in 2 days
  const todayStr = new Date().toISOString().split('T')[0];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const initialCheckIn = searchParams.get('checkIn') || todayStr;
  const initialCheckOut = searchParams.get('checkOut') || nextDateStr;

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [acFilter, setAcFilter] = useState('');
  const [bedsFilter, setBedsFilter] = useState(searchParams.get('guests') ? String(Math.ceil(Number(searchParams.get('guests')) / 2)) : '');

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
      toast.error('Failed to load hotel information');
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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Property link copied to clipboard!');
    } else {
      toast.info('Share URL: ' + window.location.href);
    }
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

      toast.success('Your verified review was published successfully!');
      setReviewSuccess('Your verified review was published successfully!');
      setNewComment('');
      setShowReviewForm(false);
      setIsEligibleToReview(false);
      fetchReviews();
      fetchHotelDetails();
    } catch (err) {
      setReviewError(err.message);
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!hotel && loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">Loading luxury stay details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Hotel not found</h2>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-emerald-600 hover:underline">
          ← Back to hotel listings
        </Link>
      </div>
    );
  }

  // Construct gallery images list
  const galleryImages = Array.isArray(hotel.images) && hotel.images.length > 0 
    ? hotel.images 
    : [hotel.image_url];

  const amenitiesList = hotel.amenities || ['wifi', 'pool', 'spa', 'breakfast', 'parking', 'restaurant'];
  const avgScore = reviewStats?.averageRating || hotel.average_rating || hotel.star_rating;
  const totalReviewsCount = reviewStats?.totalReviews || reviews.length || hotel.review_count || 12;
  const inWishlist = isSaved(hotel.id);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Banner / Hero Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to All Stays</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Share property"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(hotel)}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                  inWishlist
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={inWishlist ? 'Remove from Saved Stays' : 'Save to Wishlist'}
              >
                <Heart size={14} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                <span className="hidden sm:inline">{inWishlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

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
        
        {/* Bento-Grid Hero Photo Gallery */}
        <div className="relative">
          {galleryImages.length >= 5 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[340px] sm:h-[440px] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800">
              {/* Primary Large Image (Span 2 cols) */}
              <div 
                className="md:col-span-2 relative group cursor-pointer overflow-hidden bg-slate-900"
                onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
              >
                <img
                  src={galleryImages[0]}
                  alt={`${hotel.name} featured`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              </div>

              {/* 2x2 Grid for Next 4 Images */}
              <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3 h-full">
                {galleryImages.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer overflow-hidden bg-slate-900"
                    onClick={() => { setLightboxIndex(idx + 1); setLightboxOpen(true); }}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} photo ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                ))}
              </div>

              {/* View all photos button */}
              <button
                type="button"
                onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                className="absolute bottom-4 right-4 py-2 px-3.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-xl text-xs font-bold backdrop-blur-md shadow-lg border border-white/20 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Camera size={14} className="text-emerald-400" />
                <span>Show all {galleryImages.length} photos</span>
              </button>
            </div>
          ) : (
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 cursor-pointer group"
                 onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
              <img
                src={galleryImages[0]}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                type="button"
                className="absolute bottom-4 right-4 py-2 px-3.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-xl text-xs font-bold backdrop-blur-md shadow-lg border border-white/20 flex items-center gap-2"
              >
                <Camera size={14} className="text-emerald-400" />
                <span>View Fullscreen</span>
              </button>
            </div>
          )}
        </div>

        {/* Gallery Lightbox Modal */}
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={galleryImages}
          initialIndex={lightboxIndex}
          title={hotel.name}
        />

        {/* Property Highlights & Nightly Tariffs Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">About This Handpicked Stay</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {hotel.description || 'Welcome to an oasis of serene luxury and authentic Kerala hospitality. Featuring scenic mountain and waterfront views, curated heritage dining, and world-class leisure facilities.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">Verified Cleanliness & Hygiene Standard</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">24/7 Front Desk & Concierge Care</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">Instant Confirmation & QR Check-in</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Starting Tariffs</span>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                ₹{Number(hotel.min_price || 2500).toLocaleString('en-IN')} 
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">/ night</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Includes complimentary fiber Wi-Fi, free cancellations up to 24h prior, and authentic Kerala breakfast in select rooms.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Member Privilege</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Use code <strong>WELCOME20</strong> at checkout to save up to 20% on your stay.</p>
            </div>
          </div>
        </div>

        {/* Property Amenities Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400" />
              <span>Property Amenities & Services</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Everything provided on-site to make your stay effortless and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {amenitiesList.map((key) => {
              const details = AMENITY_DETAILS[key] || { label: key, desc: 'Verified property amenity', icon: Check };
              const Icon = details.icon;
              return (
                <div key={key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{details.label}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{details.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location & Embedded Interactive Map */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={20} className="text-emerald-600 dark:text-emerald-400" />
                <span>Property Location & Neighborhood</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {hotel.address} • Coordinates: {Number(hotel.latitude || 9.9885).toFixed(4)}° N, {Number(hotel.longitude || 76.2657).toFixed(4)}° E
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude || 9.9885},${hotel.longitude || 76.2657}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
            >
              <span>Get Directions</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Leaflet Embedded Map */}
          <div className="h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <HotelMap
              hotels={[hotel]}
              selectedHotel={hotel}
              singleHotelMode={true}
            />
          </div>
        </div>

        {/* Date Selector & Room Availability Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Check Availability & Choose Your Room</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your check-in and check-out dates to view available rooms in real-time.
            </p>
          </div>

          {/* Date Picker Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Check-In Date</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Check-Out Date</span>
              </label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Wind size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Climate</span>
              </label>
              <select
                value={acFilter}
                onChange={(e) => setAcFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="">All (AC & Non-AC)</option>
                <option value="ac">Air Conditioned (AC)</option>
                <option value="nonac">Non-AC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Bed size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Bed Capacity</span>
              </label>
              <select
                value={bedsFilter}
                onChange={(e) => setBedsFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
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
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Found {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} for {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
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
                          ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{room.category_name}</h4>
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Room {room.room_number}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <Wind size={12} />
                            <span>{room.ac === 'ac' ? 'Air Conditioned' : 'Non-AC'}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Bed size={12} />
                            <span>{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Users size={12} />
                            <span>Up to {room.capacity} Guests</span>
                          </span>
                        </div>

                        {room.category_description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{room.category_description}</p>
                        )}
                      </div>

                      {/* Pricing & Booking Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 gap-2 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-slate-900 dark:text-white">
                              ₹{Number(room.price_per_night).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">/ night</span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
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
                          <span className="py-1.5 px-3 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-emerald-600 dark:text-emerald-400" />
                <span>Verified Guest Reviews & Ratings</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                <Shield size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Verified Stay required to post reviews</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline self-start sm:self-auto"
              >
                Sign in to review
              </button>
            )}
          </div>

          {reviewSuccess && (
            <div className="p-3 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{reviewSuccess}</span>
            </div>
          )}

          {/* Write Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="p-4 bg-emerald-50/60 dark:bg-slate-800/60 rounded-2xl border border-emerald-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950 dark:text-white">Share Your Experience</h4>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">Booking Ref: {eligibleBooking?.bookingCode}</span>
              </div>

              {reviewError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{reviewError}</p>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Rating:</label>
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
                            : 'text-slate-300 dark:text-slate-600'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">{newRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Review Comment:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell future guests about your stay, room comfort, hospitality, dining, or amenities..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 items-center">
            <div className="text-center sm:text-left sm:border-r border-slate-200/80 dark:border-slate-800 sm:pr-6">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overall Guest Score</span>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{avgScore}</span>
                <div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Based on {totalReviewsCount} reviews</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-500 dark:text-slate-400">5 Star</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="w-8 text-slate-400 text-right">85%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-500 dark:text-slate-400">4 Star</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="w-8 text-slate-400 text-right">12%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-500 dark:text-slate-400">3 Star</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
                <div key={rev.id} className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-750 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {(rev.user_full_name || rev.username || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {rev.user_full_name || rev.username || 'Verified Guest'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200/50 dark:border-emerald-800">
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
                          className={s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
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
