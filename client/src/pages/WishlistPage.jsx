import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Trash2, ArrowRight, BedDouble, Scale } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useComparison } from '../context/ComparisonContext.jsx';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { isInComparison, toggleComparison } = useComparison();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 border border-rose-200 dark:border-rose-900">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Saved Stays
              </h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {wishlist.length} {wishlist.length === 1 ? 'property' : 'properties'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your personalized collection of bookmarked hotels and luxury Kerala resorts.
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Wishlist Grid or Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-400 mx-auto flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No saved stays yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              When exploring hotels on Hotelier, click the heart icon on any property to save it here for fast comparisons and booking.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition"
            >
              <span>Explore Kerala Hotels</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {wishlist.map((hotel) => (
              <div
                key={hotel.id}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image & Heart Button */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Destination Tag */}
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white rounded-md backdrop-blur-sm">
                    {hotel.place_name || 'Kerala'}
                  </span>

                  {/* Remove & Compare Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => toggleComparison(hotel)}
                      className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-105 ${
                        isInComparison(hotel.id)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-emerald-600'
                      }`}
                      aria-label="Compare hotel"
                      title={isInComparison(hotel.id) ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                    >
                      <Scale className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(hotel)}
                      className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:scale-110 shadow-md backdrop-blur-sm transition"
                      aria-label="Remove from wishlist"
                      title="Remove from saved stays"
                    >
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{hotel.average_rating || hotel.star_rating || 4.5}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {hotel.star_rating}-Star Hotel
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1">
                      {hotel.name}
                    </h3>

                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hotel.address}</span>
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Starting from</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(hotel.min_price || 2500)}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / night</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleComparison(hotel)}
                        className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition border ${
                          isInComparison(hotel.id)
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{isInComparison(hotel.id) ? 'Comparing' : 'Compare'}</span>
                      </button>

                      <Link
                        to={`/hotel/${hotel.id}`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
