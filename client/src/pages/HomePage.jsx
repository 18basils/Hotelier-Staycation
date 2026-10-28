import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Building2, Phone, Filter, Sparkles, ChevronRight, BedDouble } from 'lucide-react';

export default function HomePage() {
  const [hotels, setHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [selectedPlaceId, minRating]);

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/hotels/places');
      const data = await res.json();
      setPlaces(data.places || []);
    } catch (err) {
      console.error('Failed to load places:', err);
    }
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPlaceId) params.append('placeId', selectedPlaceId);
      if (minRating) params.append('minRating', minRating);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/hotels?${params.toString()}`);
      const data = await res.json();
      setHotels(data.hotels || []);
    } catch (err) {
      console.error('Failed to load hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Discover Top-Rated Accommodations Across Kerala</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Reserve Your Dream Stay <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300">
              With Comfort & Ease
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal">
            Browse verified luxury resorts, cozy hill-station lodges, and beachside retreats. Compare room categories, verify real-time availability, and book instantly.
          </p>

          {/* Search Bar Bar */}
          <div className="max-w-3xl mx-auto mt-8 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/20 text-slate-800">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hotel name, address, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 transition-colors"
                />
              </div>

              {/* Destination Filter */}
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full sm:w-44 py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium cursor-pointer"
              >
                <option value="">All Destinations</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name} ({place.hotel_count})
                  </option>
                ))}
              </select>

              {/* Star Rating Filter */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full sm:w-36 py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium cursor-pointer"
              >
                <option value="">Any Rating</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                <option value="4">⭐⭐⭐⭐ (4+ Star)</option>
                <option value="3">⭐⭐⭐ (3+ Star)</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 px-6 font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Search size={16} />
                <span>Find</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Destination Pills */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-emerald-600" />
              <span>Popular Destinations</span>
            </h2>
            {selectedPlaceId && (
              <button
                onClick={() => setSelectedPlaceId('')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Reset Destination Filter
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

        {/* Hotels Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Featured Properties</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} ready for reservations
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 max-w-md mx-auto">
              <Building2 size={40} className="mx-auto text-slate-400 stroke-1" />
              <h3 className="text-base font-bold text-slate-800 mt-3">No hotels matched your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your destination, star rating, or search query.</p>
              <button
                onClick={() => {
                  setSelectedPlaceId('');
                  setMinRating('');
                  setSearchQuery('');
                  fetchHotels();
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Hotel Image & Badges */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={hotel.image_url}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900/70 backdrop-blur-md rounded-lg flex items-center gap-1 shadow-sm">
                        <MapPin size={12} className="text-emerald-400" />
                        <span>{hotel.place_name}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-300/90 backdrop-blur-md rounded-lg flex items-center gap-1 shadow-sm">
                        <Star size={12} className="fill-amber-900" />
                        <span>{hotel.star_rating} Star</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span>{hotel.address}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Phone size={12} className="shrink-0" />
                        <span>{hotel.contact_no}</span>
                      </p>

                      {hotel.description && (
                        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                          {hotel.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Starts at</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-emerald-700">
                            ₹{Number(hotel.min_price || 2500).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-500">/ night</span>
                        </div>
                      </div>

                      <Link
                        to={`/hotel/${hotel.id}`}
                        className="py-2 px-3.5 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1 group-hover:bg-emerald-600"
                      >
                        <span>View Rooms</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
