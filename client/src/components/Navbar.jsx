import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { Hotel, CalendarCheck, ShieldCheck, LogOut, User, Heart, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, openLoginModal } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Hotel size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Hotelier</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
                  Resort & Stay
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">Find & Book Your Next Getaway</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/')
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Explore Hotels
            </Link>

            <Link
              to="/wishlist"
              className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/wishlist')
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heart size={16} className={wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              <span>Saved Stays</span>
              {wishlistCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/my-bookings')
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck size={16} />
                <span>My Bookings</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                    : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/40'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Mobile Wishlist Shortcut */}
            <Link
              to="/wishlist"
              className="md:hidden relative p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 rounded-xl bg-slate-100 dark:bg-slate-800 transition"
              aria-label="View Saved Stays"
            >
              <Heart size={18} className={wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.fullName || user.username}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-2 py-2 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
