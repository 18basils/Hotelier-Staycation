import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../context/ComparisonContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  X, ArrowRight, Check, Minus, Star, MapPin, 
  Wifi, Waves, Sparkles, Coffee, Zap, Dog, Eye, Car, Scale, Trash2
} from 'lucide-react';

const AMENITY_KEYS = [
  { id: 'wifi', label: 'Free Wi-Fi', icon: Wifi },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'spa', label: 'Ayurvedic Spa', icon: Sparkles },
  { id: 'breakfast', label: 'Breakfast Included', icon: Coffee },
  { id: 'ev', label: 'EV Charging', icon: Zap },
  { id: 'pet', label: 'Pet Friendly', icon: Dog },
  { id: 'sea_view', label: 'Scenic View', icon: Eye },
  { id: 'parking', label: 'Valet Parking', icon: Car }
];

export default function ComparisonDrawer() {
  const { 
    comparisonList, 
    comparisonCount, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    removeFromComparison, 
    clearComparison 
  } = useComparison();
  const { formatPrice } = useCurrency();

  if (comparisonCount === 0) return null;

  return (
    <>
      {/* 1. Floating Bottom Bar */}
      {!isDrawerOpen && (
        <aside 
          aria-label="Hotel Comparison Toolbar"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl p-3 sm:p-4 animate-in fade-in slide-in-from-bottom duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Selected thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold shrink-0">
                <Scale size={15} />
                <span>Compare ({comparisonCount}/3)</span>
              </div>

              <div className="flex items-center gap-2">
                {comparisonList.map((hotel) => (
                  <div 
                    key={hotel.id}
                    className="relative group flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl pr-2 pl-1 py-1 shrink-0"
                  >
                    <img 
                      src={hotel.image_url || hotel.images?.[0]} 
                      alt={hotel.name}
                      className="w-8 h-8 rounded-lg object-cover" 
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[100px] truncate leading-tight">
                        {hotel.name}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatPrice(hotel.min_price || 2500)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromComparison(hotel.id)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full transition-colors"
                      title="Remove from comparison"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearComparison}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>Compare Side-by-Side</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Full Side-by-Side Comparison Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Scale size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Side-by-Side Stay Comparison
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comparing {comparisonCount} properties side by side across pricing, amenities & guest reviews
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearComparison}
                  className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-medium flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Comparison Table / Matrix (Scrollable) */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div className="min-w-[650px]">
                {/* Property Columns */}
                <div className={`grid gap-4 sm:gap-6 ${
                  comparisonCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                  comparisonCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {comparisonList.map((hotel) => (
                    <div 
                      key={hotel.id}
                      className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col"
                    >
                      {/* Top Preview */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img 
                          src={hotel.image_url || hotel.images?.[0]} 
                          alt={hotel.name}
                          className="w-full h-full object-cover" 
                        />
                        <button
                          onClick={() => removeFromComparison(hotel.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-rose-500 shadow-md backdrop-blur-sm transition-colors"
                          title="Remove from comparison"
                        >
                          <X size={15} />
                        </button>
                        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white rounded-md backdrop-blur-sm">
                          {hotel.place_name || 'Kerala'}
                        </span>
                      </div>

                      {/* Header Info */}
                      <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/80">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                          {hotel.name}
                        </h3>
                        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          <MapPin size={13} className="shrink-0 text-slate-400" />
                          <span>{hotel.address}</span>
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                              <Star size={13} className="fill-amber-400" />
                              <span>{hotel.average_rating || hotel.star_rating || 4.5}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {hotel.star_rating}-Star
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">From</span>
                            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(hotel.min_price || 2500)}
                            </span>
                            <span className="text-[10px] text-slate-500"> /night</span>
                          </div>
                        </div>

                        <Link
                          to={`/hotel/${hotel.id}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>View & Book Stay</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>

                      {/* Amenities Checklist Matrix */}
                      <div className="p-4 space-y-2.5 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                          Amenities Included
                        </p>

                        {AMENITY_KEYS.map((amenity) => {
                          const Icon = amenity.icon;
                          const hasAmenity = Array.isArray(hotel.amenities) && 
                            hotel.amenities.some((a) => a.toLowerCase().includes(amenity.id));

                          return (
                            <div 
                              key={amenity.id}
                              className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs ${
                                hasAmenity 
                                  ? 'bg-emerald-500/10 text-slate-800 dark:text-slate-200 font-medium' 
                                  : 'text-slate-400 dark:text-slate-500 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={14} className={hasAmenity ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                                <span>{amenity.label}</span>
                              </div>
                              {hasAmenity ? (
                                <Check size={14} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                              ) : (
                                <Minus size={14} className="text-slate-300 dark:text-slate-600" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
