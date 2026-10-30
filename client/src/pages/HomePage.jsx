import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Star, Building2, ChevronRight, Wifi, Waves, Sparkles, Coffee, Zap, Dog, Eye, 
  Car, SlidersHorizontal, RotateCcw, Map as MapIcon, List, Heart, Calendar, Users
} from 'lucide-react';
import HotelMap from '../components/HotelMap.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { usePlaces, useHotels } from '../hooks/useHotelQueries.js';

const AMENITY_LIST = [
  { id: 'wifi', label: 'Free Wi-Fi', icon: Wifi },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'spa', label: 'Ayurvedic Spa', icon: Sparkles },
  { id: 'breakfast', label: 'Breakfast Included', icon: Coffee },
  { id: 'ev', label: 'EV Charging', icon: Zap },
  { id: 'pet', label: 'Pet Friendly', icon: Dog },
  { id: 'sea_view', label: 'Scenic View', icon: Eye },
  { id: 'parking', label: 'Free Valet', icon: Car }
];

export default function HomePage() {
  const { isSaved, toggleWishlist } = useWishlist();

  // Global Search & Date Filters
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Map View Mode: false = Grid View, true = Split/Map View
  const [showMap, setShowMap] = useState(false);
  const [selectedMapHotelId, setSelectedMapHotelId] = useState(null);

  // TanStack Query for Places & Hotels (automatic caching & background sync)
  const { data: places = [] } = usePlaces();
  const { data: hotels = [], isLoading: loading, isFetching } = useHotels({
    placeId: selectedPlaceId,
    minRating,
    search: submittedSearch,
    maxPrice,
    amenities: selectedAmenities,
    checkIn,
    checkOut,
    guests
  });

  useEffect(() => {
    // Default checkIn tomorrow, checkOut in 3 days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkoutDate = new Date();
    checkoutDate.setDate(checkoutDate.getDate() + 3);

    const formatYMD = (d) => d.toISOString().split('T')[0];
    setCheckIn(formatYMD(tomorrow));
    setCheckOut(formatYMD(checkoutDate));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(searchQuery.trim());
  };

  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const resetAllFilters = () => {
    setSelectedPlaceId('');
    setMinRating('');
    setSearchQuery('');
    setSubmittedSearch('');
    setMaxPrice(15000);
    setSelectedAmenities([]);
  };

  const hasActiveFilters = Boolean(
    selectedPlaceId || minRating || searchQuery || maxPrice < 15000 || selectedAmenities.length > 0
  );

  return (
    <div className="min-h-screen pb-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Discover Verified Luxury Stays & Resort Escapes Across Kerala</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Reserve Your Dream Stay <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300">
              With Interactive Maps & Live Availability
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal">
            Explore handpicked Kerala resorts, tea garden villas, and beachfront hideaways. Search real-time availability by dates, view interactive price maps, and save your favorite stays.
          </p>

          {/* Global Search Bar with Live Date Availability */}
          <div className="max-w-5xl mx-auto mt-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {/* Keyword Search */}
              <div className="relative lg:col-span-2">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Hotel name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white transition-colors"
                />
              </div>

              {/* Destination Filter */}
              <div>
                <select
                  value={selectedPlaceId}
                  onChange={(e) => setSelectedPlaceId(e.target.value)}
                  className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="">All Destinations</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} ({place.hotel_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-In Date */}
              <div className="relative">
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  title="Check-In Date"
                />
              </div>

              {/* Check-Out Date */}
              <div className="relative">
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full py-2 px-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  title="Check-Out Date"
                />
              </div>

              {/* Guests Count & Submit */}
              <div className="flex gap-2">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full py-2 px-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>

                <button
                  type="submit"
                  className="py-2 px-4 font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Search size={15} />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Destination Pills */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin size={20} className="text-emerald-600 dark:text-emerald-400" />
              <span>Explore Destinations</span>
            </h2>
            {selectedPlaceId && (
              <button
                onClick={() => setSelectedPlaceId('')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset Destination
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {places.map((place) => {
              const isSelected = selectedPlaceId === String(place.id);
              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlaceId(isSelected ? '' : String(place.id))}
                  className={`relative group rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all h-28 sm:h-32 border-2 ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent'
                  }`}
                >
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-3 text-white">
                    <p className="font-bold text-sm sm:text-base leading-tight drop-shadow">{place.name}</p>
                    <p className="text-[11px] text-emerald-300 font-medium">{place.hotel_count} Properties</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structured Filtering Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Structured Amenities & Price Range</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 self-start sm:self-auto"
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Amenities Multi-select Pills */}
            <div className="lg:col-span-2">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Filter by Amenities:</span>
              <div className="flex flex-wrap gap-2">
                {AMENITY_LIST.map((amenity) => {
                  const Icon = amenity.icon;
                  const isActive = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs scale-102'
                          : 'bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                      <span>{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div className="bg-slate-50/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Max Budget:</span>
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                  {maxPrice >= 15000 ? 'Any Budget' : `Up to ₹${maxPrice.toLocaleString('en-IN')}/night`}
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹1,500</span>
                <span>₹7,500</span>
                <span>₹15,000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header with View Toggle (Map vs Grid) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Featured Accommodations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {hotels.length} {hotels.length === 1 ? 'stay' : 'stays'} 
              {checkIn && checkOut ? ` available for ${checkIn} to ${checkOut}` : ' with verified reviews'}
            </p>
          </div>

          {/* Interactive Map Toggle Button */}
          <button
            onClick={() => setShowMap((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
              showMap
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {showMap ? (
              <>
                <List size={16} />
                <span>Show List View</span>
              </>
            ) : (
              <>
                <MapIcon size={16} />
                <span>Show on Map ({hotels.length} pins)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Display: Split-Screen Map View OR Standard Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-88 bg-slate-200/60 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-md mx-auto">
            <Building2 size={40} className="mx-auto text-slate-400 stroke-1" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-3">No hotels available for your dates</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your check-in dates, guest capacity, or clearing amenity checkboxes.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : showMap ? (
          /* Split Screen: Left Hotel Cards, Right Leaflet Map */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Scrollable Hotel Cards Column */}
            <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  onMouseEnter={() => setSelectedMapHotelId(hotel.id)}
                  className={`group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col sm:flex-row shadow-sm hover:shadow-lg ${
                    selectedMapHotelId === hotel.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="relative w-full sm:w-44 h-40 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={hotel.image_url}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(hotel);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:scale-110 shadow-sm transition"
                      aria-label="Save to Wishlist"
                    >
                      <Heart size={15} className={isSaved(hotel.id) ? 'fill-rose-500' : ''} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{hotel.place_name}</span>
                        <span className="font-bold text-amber-500">★ {hotel.average_rating || hotel.star_rating}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition">
                        {hotel.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {hotel.address}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-none">Nightly</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ₹{Number(hotel.min_price || 2500).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Link
                        to={`/hotel/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Interactive Map Column */}
            <div className="lg:col-span-7 sticky top-20 h-[750px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <HotelMap
                hotels={hotels}
                selectedHotelId={selectedMapHotelId}
                onSelectHotel={(h) => setSelectedMapHotelId(h.id)}
                height="100%"
                zoom={8}
              />
            </div>
          </div>
        ) : (
          /* Standard 3-Column Responsive Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {hotels.map((hotel) => {
              const amenities = hotel.amenities || [];
              const avgRating = hotel.average_rating ? Number(hotel.average_rating).toFixed(1) : hotel.star_rating;
              const reviewCount = hotel.review_count || 12;
              const saved = isSaved(hotel.id);

              return (
                <div
                  key={hotel.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Hotel Image, Location Badge, Rating & Wishlist Heart */}
                  <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={hotel.image_url}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Wishlist Heart Icon (Top-Left) */}
                    <button
                      onClick={() => toggleWishlist(hotel)}
                      className="absolute top-3 left-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:scale-115 shadow-md backdrop-blur-sm transition"
                      aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      title={saved ? 'Remove from Saved Stays' : 'Save Stay'}
                    >
                      <Heart size={16} className={saved ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'} />
                    </button>

                    {/* Destination Pill */}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900/75 backdrop-blur-md rounded-lg flex items-center gap-1 shadow-sm">
                        <MapPin size={12} className="text-emerald-400" />
                        <span>{hotel.place_name}</span>
                      </span>
                    </div>

                    {/* Verified Rating Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 text-xs font-extrabold text-amber-950 bg-amber-300/95 backdrop-blur-md rounded-lg flex items-center gap-1 shadow-sm">
                        <Star size={13} className="fill-amber-900 text-amber-900" />
                        <span>{avgRating}</span>
                        <span className="text-[10px] font-medium opacity-80">({reviewCount})</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span>{hotel.address}</span>
                      </p>

                      {hotel.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                          {hotel.description}
                        </p>
                      )}

                      {/* Structured Amenities Badges */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                        {amenities.slice(0, 4).map((aId) => {
                          const found = AMENITY_LIST.find((item) => item.id === aId);
                          if (!found) return null;
                          const Icon = found.icon;
                          return (
                            <span
                              key={aId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                              title={found.label}
                            >
                              <Icon size={12} className="text-emerald-600 dark:text-emerald-400" />
                              <span>{found.label}</span>
                            </span>
                          );
                        })}
                        {amenities.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            +{amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Starts at</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                            ₹{Number(hotel.min_price || 2500).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">/ night</span>
                        </div>
                      </div>

                      <Link
                        to={`/hotel/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                        className="py-2 px-3.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1 group-hover:bg-emerald-600"
                      >
                        <span>View & Book</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
