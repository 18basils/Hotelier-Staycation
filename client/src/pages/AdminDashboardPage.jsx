import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  useAdminStats, useAdminAnalytics, useHotels, usePlaces, 
  useCategories, useAdminRooms, useAdminReservations, useAdminCoupons 
} from '../hooks/useHotelQueries';
import AdminAnalytics from '../components/AdminAnalytics';
import ImageDropzone from '../components/ImageDropzone';
import { 
  Building2, Plus, BedDouble, CalendarCheck, DollarSign, 
  Trash2, ShieldCheck, Star, MapPin, Phone, Users, CheckCircle, Ban,
  TrendingUp, BarChart3, Edit3, Settings, Upload, Wrench, Eye, 
  RefreshCw, Layers, Compass, ArrowRight, X, Check, Search, Filter,
  Download, FileSpreadsheet, Tag, TicketPercent, Copy, Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token, isAdmin } = useAuth();
  const { toast, confirmDialog } = useToast();
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'hotels', 'rooms', 'bookings', 'coupons', 'destinations'

  // TanStack Queries for Admin Data
  const { data: stats = null, isLoading: statsLoading } = useAdminStats(token, isAdmin);
  const { data: analytics = null, isLoading: analyticsLoading } = useAdminAnalytics(token, isAdmin);
  const { data: hotels = [], isLoading: hotelsLoading } = useHotels({});
  const { data: places = [], isLoading: placesLoading } = usePlaces();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: allRooms = [], isLoading: roomsLoading } = useAdminRooms(token, '', isAdmin);
  const { data: allReservations = [], isLoading: resLoading } = useAdminReservations(token, isAdmin);
  const { data: allCoupons = [], isLoading: couponsLoading } = useAdminCoupons(token, isAdmin);

  const loading = statsLoading || hotelsLoading || roomsLoading || couponsLoading;

  // Search & Filter in Rooms
  const [roomFilterHotelId, setRoomFilterHotelId] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');

  // Search & Filter in Bookings
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');
  const [bookingFilterHotelId, setBookingFilterHotelId] = useState('ALL');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Export Financial Report Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'ALL',
    hotelId: 'ALL'
  });
  const [isExporting, setIsExporting] = useState(false);

  // Promo Code Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '20',
    maxDiscount: '2000',
    minBookingValue: '1500',
    description: '',
    expiresAt: '',
    active: true
  });

  // Add / Edit Hotel Form State
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null); // null = Add, object = Edit
  const [hotelForm, setHotelForm] = useState({
    placeId: '',
    name: '',
    address: '',
    starRating: '4',
    contactNo: '',
    description: '',
    imageUrl: '',
    minPrice: '2500',
    latitude: '9.9885',
    longitude: '76.2657',
    featured: false
  });

  // Add / Edit Room State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    hotelId: '',
    categoryId: '',
    roomNumber: '',
    pricePerNight: '',
    status: 'available'
  });

  // Add Destination State
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placeForm, setPlaceForm] = useState({
    name: '',
    state: 'Kerala',
    description: '',
    imageUrl: ''
  });

  // Add Category State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    beds: '2',
    ac: 'ac',
    capacity: '2',
    description: ''
  });

  const [formError, setFormError] = useState('');

  const loadAllData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['hotels'] });
    queryClient.invalidateQueries({ queryKey: ['places'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
    queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
  };

  // ================= Hotel Handlers =================
  const handleOpenAddHotel = () => {
    setEditingHotel(null);
    setFormError('');
    setHotelForm({
      placeId: places[0]?.id || '',
      name: '',
      address: '',
      starRating: '4',
      contactNo: '',
      description: '',
      imageUrl: '',
      minPrice: '2500',
      latitude: '9.9885',
      longitude: '76.2657',
      featured: false
    });
    setHotelModalOpen(true);
  };

  const handleOpenEditHotel = (h) => {
    setEditingHotel(h);
    setFormError('');
    setHotelForm({
      placeId: h.place_id || '',
      name: h.name || '',
      address: h.address || '',
      starRating: String(h.star_rating || 4),
      contactNo: h.contact_no || '',
      description: h.description || '',
      imageUrl: h.image_url || '',
      minPrice: String(h.min_price || 2500),
      latitude: String(h.latitude || 9.9885),
      longitude: String(h.longitude || 76.2657),
      featured: Boolean(h.featured)
    });
    setHotelModalOpen(true);
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const url = editingHotel ? `/api/admin/hotels/${editingHotel.id}` : '/api/admin/hotels';
      const method = editingHotel ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(hotelForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save hotel');

      toast.success(editingHotel ? 'Hotel property updated successfully!' : 'New hotel added to platform!');
      setHotelModalOpen(false);
      loadAllData();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteHotel = (hotelId, hotelName) => {
    confirmDialog({
      title: 'Delete Hotel Property?',
      message: `Are you sure you want to delete "${hotelName || 'this hotel'}" and all its associated rooms and bookings? This action cannot be reversed.`,
      confirmText: 'Yes, Delete Property',
      cancelText: 'Keep Hotel',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete hotel');
          }

          toast.success('Property removed from system');
          loadAllData();
        } catch (err) {
          toast.error(err.message || 'Failed to delete hotel');
        }
      }
    });
  };

  // ================= Room Handlers =================
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setFormError('');
    setRoomForm({
      hotelId: hotels[0]?.id || '',
      categoryId: categories[0]?.id || '',
      roomNumber: '',
      pricePerNight: '3500',
      status: 'available'
    });
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (r) => {
    setEditingRoom(r);
    setFormError('');
    setRoomForm({
      hotelId: r.hotel_id,
      categoryId: r.category_id,
      roomNumber: r.room_number,
      pricePerNight: String(r.price_per_night),
      status: r.status || 'available'
    });
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const url = editingRoom ? `/api/admin/rooms/${editingRoom.id}` : '/api/admin/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(roomForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save room unit');

      toast.success(editingRoom ? 'Room details updated!' : 'Room unit added to hotel!');
      setRoomModalOpen(false);
      loadAllData();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleToggleRoomStatus = async (room) => {
    const newStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
    try {
      const res = await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to toggle room status');
      toast.success(`Room ${room.room_number} marked as ${newStatus === 'maintenance' ? 'Under Maintenance' : 'Available'}`);
      loadAllData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteRoom = (roomId, roomNumber) => {
    confirmDialog({
      title: 'Remove Room Unit?',
      message: `Are you sure you want to delete Room ${roomNumber}?`,
      confirmText: 'Delete Room',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/rooms/${roomId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete room');
          toast.success(`Room ${roomNumber} deleted`);
          loadAllData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  // ================= Destination & Category Handlers =================
  const handleCreatePlace = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(placeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create destination');
      toast.success('New destination added!');
      setPlaceModalOpen(false);
      setPlaceForm({ name: '', state: 'Kerala', description: '', imageUrl: '' });
      loadAllData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeletePlace = (placeId, name) => {
    confirmDialog({
      title: 'Delete Destination?',
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: 'Delete Destination',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/places/${placeId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete destination');
          toast.success('Destination removed');
          loadAllData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      toast.success('New room category registered!');
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', beds: '2', ac: 'ac', capacity: '2', description: '' });
      loadAllData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteCategory = (catId, name) => {
    confirmDialog({
      title: 'Delete Room Category?',
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: 'Delete Category',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/categories/${catId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete category');
          toast.success('Category removed');
          loadAllData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  // ================= Reservation Status Handler =================
  const handleUpdateBookingStatus = async (resId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update reservation status');
      }

      toast.success(`Booking status updated to ${newStatus}`);
      loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // ================= Financial Report CSV Export Handler =================
  const handleExportFinancialReport = async (customFilters = null) => {
    setIsExporting(true);
    try {
      const activeFilters = customFilters || exportFilters;
      const params = new URLSearchParams();
      if (activeFilters.status && activeFilters.status !== 'ALL') params.append('status', activeFilters.status);
      if (activeFilters.hotelId && activeFilters.hotelId !== 'ALL') params.append('hotelId', activeFilters.hotelId);
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);

      const res = await fetch(`/api/admin/reports/financial/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download financial export');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `hotelier_financial_report_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      toast.success('Financial CSV report downloaded successfully');
      setExportModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to export financial report');
    } finally {
      setIsExporting(false);
    }
  };

  // ================= Promo Code Handlers =================
  const generateRandomCoupon = () => {
    const prefixes = ['HOTELIER', 'STAY', 'KERALA', 'LUXURY', 'HOLIDAY', 'WANDER'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = Math.floor(10 + Math.random() * 90);
    setCouponForm((prev) => ({ ...prev, code: `${p}${n}` }));
  };

  const handleOpenAddCoupon = () => {
    setFormError('');
    setCouponForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '20',
      maxDiscount: '2000',
      minBookingValue: '1500',
      description: 'Special seasonal staycation promo',
      expiresAt: '',
      active: true
    });
    setCouponModalOpen(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (!couponForm.code || !couponForm.discountValue || !couponForm.description) {
        throw new Error('Please fill all mandatory promo code fields');
      }

      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
        minBookingValue: Number(couponForm.minBookingValue) || 0,
        description: couponForm.description.trim(),
        expiresAt: couponForm.expiresAt || null,
        active: Boolean(couponForm.active)
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create promo code');
      }

      toast.success(`Promo code ${payload.code} created successfully!`);
      setCouponModalOpen(false);
      loadAllData();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle promo code');

      toast.success(data.message || 'Promo code status updated');
      loadAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle coupon');
    }
  };

  const handleDeleteCoupon = (couponId, code) => {
    confirmDialog({
      title: 'Delete Promo Code?',
      message: `Are you sure you want to permanently delete promo code "${code}"? Guests will no longer be able to use it.`,
      confirmText: 'Delete Code',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/coupons/${couponId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete promo code');
          toast.success(`Promo code ${code} deleted`);
          loadAllData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShieldCheck size={48} className="mx-auto text-amber-600 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please sign in using administrator credentials to access this control center.</p>
      </div>
    );
  }

  // Filtered rooms
  const filteredRooms = allRooms.filter((r) => {
    if (roomFilterHotelId && r.hotel_id !== roomFilterHotelId) return false;
    if (roomSearchQuery.trim()) {
      const q = roomSearchQuery.toLowerCase();
      return (
        r.room_number?.toLowerCase().includes(q) ||
        r.hotel_name?.toLowerCase().includes(q) ||
        r.category_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered reservations
  const filteredReservations = allReservations.filter((res) => {
    if (bookingFilterStatus !== 'ALL' && res.status !== bookingFilterStatus) return false;
    if (bookingFilterHotelId !== 'ALL' && res.hotel_id !== bookingFilterHotelId) return false;
    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      return (
        res.booking_code?.toLowerCase().includes(q) ||
        res.guest_name?.toLowerCase().includes(q) ||
        res.hotel_name?.toLowerCase().includes(q) ||
        res.room_number?.toLowerCase().includes(q) ||
        res.username?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <ShieldCheck size={22} />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Administrator Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual analytics, financial CSV reports, promo codes, hotel inventory, and guest reservations (v4.3.0)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/80 rounded-xl transition-all shadow-xs"
            title="Export CSV Financial Ledger & Occupancy Reports"
          >
            <FileSpreadsheet size={15} className="text-amber-600 dark:text-amber-400" />
            <span>Export Financial CSV</span>
          </button>
          <button
            onClick={loadAllData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAddHotel}
            className="flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all"
          >
            <Plus size={15} />
            <span>Add Hotel</span>
          </button>
          <button
            onClick={handleOpenAddRoom}
            className="flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <Plus size={15} />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-2 transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <BarChart3 size={16} />
          <span>Visual Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`pb-3 px-2 transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'hotels'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Building2 size={16} />
          <span>Properties ({hotels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-3 px-2 transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rooms'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <BedDouble size={16} />
          <span>Rooms Inventory ({allRooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-2 transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'bookings'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <CalendarCheck size={16} />
          <span>Guest Bookings ({allReservations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 px-2 transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'coupons'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <TicketPercent size={16} />
          <span>Promo Codes ({allCoupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('destinations')}
          className={`pb-3 px-2 transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'destinations'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Layers size={16} />
          <span>Destinations & Categories</span>
        </button>
      </div>

      {/* ================= TAB 1: VISUAL ANALYTICS & CHARTS ================= */}
      {activeTab === 'analytics' && (
        <AdminAnalytics analytics={analytics} stats={stats} />
      )}

      {/* ================= TAB 2: HOTELS MANAGEMENT ================= */}
      {activeTab === 'hotels' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Properties</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage property photos, descriptions, star ratings, and coordinates</p>
            </div>
            <button
              onClick={handleOpenAddHotel}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Property</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Star Rating</th>
                  <th className="px-5 py-3">Tariffs From</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img
                        src={h.image_url}
                        alt={h.name}
                        className="w-14 h-11 object-cover rounded-xl shrink-0 border border-slate-200/60 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white">{h.name}</p>
                          {h.featured && (
                            <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-mono">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{h.address}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {h.place_name}, {h.place_state || 'Kerala'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-lg font-bold text-amber-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-950/60 inline-flex items-center gap-1">
                        <Star size={11} className="fill-amber-900 dark:fill-amber-300" />
                        <span>{h.star_rating} Star</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
                      {formatPrice(h.min_price || 2500)}/night
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">{h.contact_no}</td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditHotel(h)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(h.id, h.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ROOMS INVENTORY ================= */}
      {activeTab === 'rooms' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rooms Inventory & Maintenance Manager</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Edit nightly tariffs, mark rooms for maintenance, or add new units</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Hotel Filter */}
              <select
                value={roomFilterHotelId}
                onChange={(e) => setRoomFilterHotelId(e.target.value)}
                className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="">All Hotels ({hotels.length})</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>

              {/* Room Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search room # or type..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                onClick={handleOpenAddRoom}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Room</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Room Identifier</th>
                  <th className="px-5 py-3">Hotel Property</th>
                  <th className="px-5 py-3">Category & Features</th>
                  <th className="px-5 py-3">Nightly Price</th>
                  <th className="px-5 py-3">Operational Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRooms.map((r) => {
                  const isMaintenance = r.status === 'maintenance';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          Room {r.room_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {r.hotel_name || r.hotel_id}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">{r.category_name}</p>
                        <p className="text-[11px] text-slate-400">
                          {r.ac === 'ac' ? 'Air Conditioned' : 'Non-AC'} • {r.beds} Bed(s) • Max {r.capacity || 2} Guests
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatPrice(r.price_per_night)}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleRoomStatus(r)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 ${
                            isMaintenance
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          }`}
                          title="Click to toggle status"
                        >
                          {isMaintenance ? <Wrench size={11} /> : <CheckCircle size={11} />}
                          <span>{isMaintenance ? 'Under Maintenance' : 'Available for Booking'}</span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditRoom(r)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                          title="Edit Room Tariffs"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id, r.room_number)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: GUEST BOOKINGS & FINANCIAL REPORTING ================= */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>All Reservations Across System</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {filteredReservations.length} {filteredReservations.length === 1 ? 'stay' : 'stays'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Track guest stays, meal packages, add-ons, invoice statuses, and download financial ledgers
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-xl transition shadow-xs"
                title="Configure and download filtered financial spreadsheet"
              >
                <FileSpreadsheet size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Export Report (CSV)</span>
              </button>

              <button
                onClick={() => handleExportFinancialReport({ status: bookingFilterStatus, hotelId: bookingFilterHotelId })}
                className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                title="Quick export of current filtered view"
              >
                <Download size={14} />
                <span>Quick Export View</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-5 py-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by guest name, booking code, hotel, room, or user..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={bookingFilterHotelId}
                onChange={(e) => setBookingFilterHotelId(e.target.value)}
                className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="ALL">All Properties</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Booking Code</th>
                  <th className="px-5 py-3">Guest & User</th>
                  <th className="px-5 py-3">Hotel & Room</th>
                  <th className="px-5 py-3">Stay Dates</th>
                  <th className="px-5 py-3">Hospitality Plan</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                      No reservations found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {res.booking_code}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">{res.guest_name}</p>
                        <p className="text-[11px] text-slate-400">User: @{res.username} • {res.guest_contact}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{res.hotel_name}</p>
                        <p className="text-[11px] text-slate-400">Room {res.room_number} ({res.category_name})</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {res.check_in} → {res.check_out}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {res.meal_plan?.name || 'Room Only'}
                        </p>
                        {Array.isArray(res.add_ons) && res.add_ons.length > 0 && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[150px]" title={res.add_ons.map((a) => a.name).join(', ')}>
                            +{res.add_ons.length} Experience(s)
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(res.total_price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                            res.status === 'CONFIRMED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : res.status === 'COMPLETED'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1">
                        {res.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(res.id, 'CONFIRMED')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {res.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(res.id, 'COMPLETED')}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {res.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(res.id, 'CANCELLED')}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PROMO CODES & DISCOUNTS ================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TicketPercent size={20} className="text-emerald-600 dark:text-emerald-400" />
                <span>Promo Code & Campaign Manager</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Create and manage promotional discounts, maximum price deductions, minimum spend barriers, and expiration windows.
              </p>
            </div>

            <button
              onClick={handleOpenAddCoupon}
              className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition"
            >
              <Plus size={15} />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCoupons.map((coupon) => {
              const isActive = coupon.active !== false;
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();

              return (
                <div
                  key={coupon.id || coupon.code}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                    !isActive
                      ? 'border-slate-200 dark:border-slate-800 opacity-60'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            toast.success(`Copied code "${coupon.code}"`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                          title="Copy Code"
                        >
                          <Copy size={13} />
                        </button>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          !isActive
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            : isExpired
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {!isActive ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {coupon.discount_type === 'PERCENTAGE'
                          ? `${coupon.discount_value}% OFF`
                          : formatPrice(coupon.discount_value) + ' FLAT'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex justify-between">
                        <span>Min Booking Value:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatPrice(coupon.min_booking_value || 0)}
                        </span>
                      </div>
                      {coupon.max_discount && (
                        <div className="flex justify-between">
                          <span>Max Discount Cap:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatPrice(coupon.max_discount)}
                          </span>
                        </div>
                      )}
                      {coupon.expires_at && (
                        <div className="flex justify-between">
                          <span>Expires On:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {coupon.expires_at}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(coupon.id || coupon.code)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.id || coupon.code, coupon.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition"
                      title="Delete Promo Code"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 5: DESTINATIONS & CATEGORIES ================= */}
      {activeTab === 'destinations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Destinations Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Compass size={17} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Destinations & Regions</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Locations available in hero search</p>
              </div>
              <button
                onClick={() => setPlaceModalOpen(true)}
                className="py-1 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Destination</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {places.map((p) => (
                <div 
                  key={p.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-750 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.image_url || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'} 
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-[11px] text-slate-400">{p.state} • slug: {p.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePlace(p.id, p.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60"
                    title="Delete Destination"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Room Categories Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BedDouble size={17} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Room Categories & Layouts</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Class specifications, AC climate & beds</p>
              </div>
              <button
                onClick={() => setCategoryModalOpen(true)}
                className="py-1 px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {categories.map((c) => (
                <div 
                  key={c.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-750 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {c.ac === 'ac' ? 'AC' : 'Non-AC'} • {c.beds} Bed(s) • Max {c.capacity || 2} Guests
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT HOTEL ================= */}
      {hotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingHotel ? 'Edit Property Details' : 'Add New Hotel Property'}
              </h3>
              <button
                onClick={() => setHotelModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveHotel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination / Place</label>
                <select
                  required
                  value={hotelForm.placeId}
                  onChange={(e) => setHotelForm({ ...hotelForm, placeId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select Destination</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}, {p.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hotel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Munnar Valley Resort"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Area, City, Pin Code"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Direct Drag & Drop Image Uploader */}
              <ImageDropzone
                label="Primary Property Photo (Drag & Drop File)"
                value={hotelForm.imageUrl}
                onChange={(newUrl) => setHotelForm({ ...hotelForm, imageUrl: newUrl })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={hotelForm.starRating}
                    onChange={(e) => setHotelForm({ ...hotelForm, starRating: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                    <option value="3">⭐⭐⭐ (3 Star)</option>
                    <option value="2">⭐⭐ (2 Star)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Nightly Tariff (₹)</label>
                  <input
                    type="number"
                    min="500"
                    value={hotelForm.minPrice}
                    onChange={(e) => setHotelForm({ ...hotelForm, minPrice: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 484 220 0000"
                    value={hotelForm.contactNo}
                    onChange={(e) => setHotelForm({ ...hotelForm, contactNo: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hotelForm.featured}
                      onChange={(e) => setHotelForm({ ...hotelForm, featured: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span>Highlight as Featured Stay</span>
                  </label>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={hotelForm.latitude}
                    onChange={(e) => setHotelForm({ ...hotelForm, latitude: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={hotelForm.longitude}
                    onChange={(e) => setHotelForm({ ...hotelForm, longitude: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Highlights of the hotel amenities, views, location..."
                  value={hotelForm.description}
                  onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="py-2.5 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow"
                >
                  {editingHotel ? 'Save Changes' : 'Save Hotel Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ROOM ================= */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add Room to Hotel'}
              </h3>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Hotel</label>
                <select
                  required
                  disabled={Boolean(editingRoom)}
                  value={roomForm.hotelId}
                  onChange={(e) => setRoomForm({ ...roomForm, hotelId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 disabled:opacity-60"
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Category</label>
                <select
                  required
                  value={roomForm.categoryId}
                  onChange={(e) => setRoomForm({ ...roomForm, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ac === 'ac' ? 'AC' : 'Non-AC'}, {c.beds} Beds)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 105 or 302B"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nightly Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="e.g. 4500"
                    value={roomForm.pricePerNight}
                    onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Operational Status</label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                >
                  <option value="available">Available for Bookings</option>
                  <option value="maintenance">Under Maintenance / Out of Order</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="py-2.5 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD DESTINATION ================= */}
      {placeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Destination</h3>
            <form onSubmit={handleCreatePlace} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varkala Cliff"
                  value={placeForm.name}
                  onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={placeForm.state}
                  onChange={(e) => setPlaceForm({ ...placeForm, state: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <ImageDropzone
                label="Destination Photo"
                value={placeForm.imageUrl}
                onChange={(newUrl) => setPlaceForm({ ...placeForm, imageUrl: newUrl })}
              />

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPlaceModalOpen(false)}
                  className="py-2 px-3 text-slate-600 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow"
                >
                  Create Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CATEGORY ================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Room Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Presidential Suite"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Beds</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={categoryForm.beds}
                    onChange={(e) => setCategoryForm({ ...categoryForm, beds: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Climate</label>
                  <select
                    value={categoryForm.ac}
                    onChange={(e) => setCategoryForm({ ...categoryForm, ac: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  >
                    <option value="ac">Air Conditioned (AC)</option>
                    <option value="nonac">Non-AC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Guest Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={categoryForm.capacity}
                  onChange={(e) => setCategoryForm({ ...categoryForm, capacity: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="py-2 px-3 text-slate-600 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXPORT FINANCIAL CSV REPORT ================= */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <FileSpreadsheet size={18} />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Financial Report</h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate an RFC 4180 compliant CSV ledger formatted with UTF-8 BOM for Microsoft Excel. Includes room tariffs, meal plans, add-ons, coupon discounts, and taxes.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExportFinancialReport();
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => setExportFilters({ ...exportFilters, startDate: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => setExportFilters({ ...exportFilters, endDate: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Filter by Property</label>
                <select
                  value={exportFilters.hotelId}
                  onChange={(e) => setExportFilters({ ...exportFilters, hotelId: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                >
                  <option value="ALL">All Properties (Full Portfolio)</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Booking Status</label>
                <select
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                >
                  <option value="ALL">All Statuses (Confirmed, Completed, Cancelled)</option>
                  <option value="CONFIRMED">Confirmed Bookings Only</option>
                  <option value="COMPLETED">Completed Stays Only</option>
                  <option value="CANCELLED">Cancelled Stays Only</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="py-2.5 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExporting}
                  className="flex-1 py-2.5 px-4 text-white bg-amber-600 hover:bg-amber-700 rounded-xl font-bold shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>{isExporting ? 'Generating CSV...' : 'Download CSV Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE PROMO CODE ================= */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <TicketPercent size={18} />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Promo Code</h3>
              </div>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Promo Code</label>
                  <button
                    type="button"
                    onClick={generateRandomCoupon}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={11} />
                    <span>Generate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono tracking-wider font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {couponForm.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={couponForm.discountType === 'PERCENTAGE' ? 90 : 100000}
                    placeholder="20"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Booking (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={couponForm.minBookingValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minBookingValue: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2000"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiration Date (optional)</label>
                <input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Campaign Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% discount on monsoon staycations"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="py-2.5 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow transition"
                >
                  Create Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
