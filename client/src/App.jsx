import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';

import HomePage from './pages/HomePage';
import HotelDetailPage from './pages/HotelDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/hotel/:id" element={<HotelDetailPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">Hotelier</span>
                      <span>• Modern Hotel Management & Reservation System</span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500">
                      Rebuilt with React 18, Vite, Tailwind CSS, Node.js & Cloud Firestore
                    </p>
                  </div>
                </footer>

                <AuthModal />
              </div>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}
