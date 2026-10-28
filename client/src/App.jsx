import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';

import HomePage from './pages/HomePage';
import HotelDetailPage from './pages/HotelDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotel/:id" element={<HotelDetailPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">Hotelier</span>
                <span>• Modern Hotel Management & Reservation System</span>
              </div>
              <p className="text-slate-400">
                Rebuilt with React 18, Vite, Tailwind CSS, Node.js & SQLite
              </p>
            </div>
          </footer>

          <AuthModal />
        </div>
      </AuthProvider>
    </Router>
  );
}
