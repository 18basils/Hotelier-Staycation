import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  User, Crown, Award, Star, ShieldCheck, Sparkles, Calendar, 
  MapPin, Heart, Clock, Gift, ArrowRight, Check, Edit3, Phone, Mail,
  Coins, TrendingUp, Zap
} from 'lucide-react';

export default function GuestProfilePage() {
  const { user, token, isAuthenticated, openLoginModal } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoyaltyData();
      fetchProfileData();
    }
  }, [isAuthenticated, token]);

  const fetchLoyaltyData = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/auth/loyalty', {
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.loyalty) {
        setLoyalty(data.loyalty);
      }
    } catch (e) {
      console.error('Failed to fetch loyalty:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setFullName(data.user.fullName || data.user.username || '');
        setPhone(data.user.phone || '');
        setPreferences(data.user.preferences || '');
      }
    } catch (e) {
      console.error('Failed to fetch profile details:', e);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          phone,
          preferences
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Your guest profile was updated successfully!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Crown size={48} className="mx-auto text-amber-500 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Sign in to view your Loyalty Portal</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Access your member tier, reward points, personalized hospitality perks, and booking history.
        </p>
        <button
          onClick={openLoginModal}
          className="mt-6 py-2.5 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const currentTier = loyalty?.tier || 'Silver Member';
  const isPlatinum = currentTier.includes('Platinum');
  const isGold = currentTier.includes('Gold');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Loyalty Status Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl border ${
        isPlatinum
          ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-purple-800/50'
          : isGold
          ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950 border-amber-800/50'
          : 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-slate-700/60'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-lg border-2 ${
              isPlatinum
                ? 'bg-purple-900/60 text-purple-200 border-purple-400'
                : isGold
                ? 'bg-amber-900/60 text-amber-200 border-amber-400'
                : 'bg-emerald-900/60 text-emerald-200 border-emerald-400'
            }`}>
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm ${
                  isPlatinum
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : isGold
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <Crown size={12} className={isGold || isPlatinum ? 'fill-current' : ''} />
                  <span>{currentTier}</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Hotelier Privilege</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                {fullName || user.username}
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-emerald-400" />
                  <span>{user.email || 'guest@hotelier.in'}</span>
                </span>
                <span>•</span>
                <span>Member since 2026</span>
              </p>
            </div>
          </div>

          {/* Reward Points Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 self-stretch md:self-auto justify-between md:justify-start">
            <div className="p-3 bg-amber-400/20 text-amber-300 rounded-xl">
              <Coins size={28} />
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Loyalty Reward Points</span>
              <p className="text-2xl font-black text-amber-300">
                {(loyalty?.points || 0).toLocaleString()} <span className="text-xs text-white/80 font-normal">pts</span>
              </p>
              <span className="text-[10px] text-emerald-300 font-medium">
                10 pts per ₹100 spent • Redeemable on bookings
              </span>
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">
              Tier Progress: <strong className="text-white">{currentTier}</strong>
            </span>
            <span className="text-slate-300 font-medium">
              {loyalty?.staysNeeded > 0
                ? `${loyalty.staysNeeded} more stay${loyalty.staysNeeded > 1 ? 's' : ''} to reach ${loyalty.nextTier}`
                : 'Highest Tier Unlocked! 🎉'}
            </span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isPlatinum
                  ? 'bg-gradient-to-r from-purple-400 to-indigo-400'
                  : isGold
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-300'
              }`}
              style={{ width: `${loyalty?.progressPercent || 33}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lifetime Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Stays</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {loyalty?.totalStays || 0}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
            Verified reservations
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Nights Stayed</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {loyalty?.totalNights || 0}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            Hospitality comfort nights
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Stays Spend</span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {formatPrice(loyalty?.totalSpend || 0)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            Converted to active currency
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Member Discount</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {loyalty?.discountPercent || 5}% OFF
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 block">
            Applied at checkout
          </span>
        </div>
      </div>

      {/* Main 2-Column: Left Tier Privileges, Right Edit Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tier Perks & Privileges Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift size={20} className="text-emerald-600 dark:text-emerald-400" />
              <span>Your Active Tier Privileges</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enjoy tailored privileges crafted exclusively for {currentTier} guests across all our Kerala resorts.
            </p>
          </div>

          <div className="space-y-3">
            {(loyalty?.perks || [
              '5% Guaranteed Member Savings on Every Stay',
              'Instant Mobile & QR Check-in',
              'Dedicated 24/7 Concierge Support'
            ]).map((perk, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-750 flex items-center gap-3 text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={14} className="stroke-[2.5]" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{perk}</span>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/my-bookings"
              className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/60 transition-all flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-emerald-950 dark:text-emerald-200">My Bookings</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">View vouchers & receipts</p>
              </div>
              <ArrowRight size={16} className="text-emerald-600 dark:text-emerald-400" />
            </Link>

            <Link
              to="/wishlist"
              className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-800/60 transition-all flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-rose-950 dark:text-rose-200">Saved Stays</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">Cloud-synced favorites</p>
              </div>
              <ArrowRight size={16} className="text-rose-600 dark:text-rose-400" />
            </Link>
          </div>
        </div>

        {/* Edit Profile Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Personal Details</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your guest name, contact phone, and hospitality preferences.
            </p>
          </div>

          {saveSuccess && (
            <div className="p-3 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospitality Preferences & Dietary Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Vegetarian breakfast preference, high floor room, feather-free pillows..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
