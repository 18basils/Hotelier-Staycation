import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Compass, Award, Calendar, DollarSign, 
  BedDouble, Building2, Users, Star 
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
const STATUS_COLORS = {
  CONFIRMED: '#10b981',
  COMPLETED: '#3b82f6',
  CANCELLED: '#ef4444'
};

export default function AdminAnalytics({ analytics, stats }) {
  if (!analytics) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">Computing hospitality analytics...</p>
      </div>
    );
  }

  const { monthlyTrends = [], destinationBreakdown = [], topHotels = [], statusCounts = {} } = analytics;

  // Format currency tooltip
  const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Booking Revenue</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp size={13} />
              <span>+18.4% vs last period</span>
            </div>
          </div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Confirmed Bookings</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalBookings || 0}
            </p>
            <span className="text-[11px] text-slate-400">Paid guest reservations</span>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-2xl">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Properties</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalHotels || 0}
            </p>
            <span className="text-[11px] text-slate-400">Across {destinationBreakdown.length} destinations</span>
          </div>
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-2xl">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Rooms Inventory</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalRooms || 0}
            </p>
            <span className="text-[11px] text-slate-400">Active live units</span>
          </div>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-2xl">
            <BedDouble size={24} />
          </div>
        </div>
      </div>

      {/* Row 1: Monthly Revenue Trend Area Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Monthly Hospitality Revenue Trends</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical gross reservation intake (in ₹ INR) and customer reservation volume
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            6-Month Trajectory
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value) : value, 
                  name === 'revenue' ? 'Gross Revenue' : 'Reservations'
                ]}
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '16px', 
                  border: 'none', 
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="revenue" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Occupancy by Destination & Booking Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Destination Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Demand by Holiday Destination</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total guest bookings and revenue captured across key regions
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="destination" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : val, name === 'revenue' ? 'Revenue' : 'Bookings']}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '16px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reservation Status Split</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fulfillment vs cancellation ratio
            </p>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Confirmed</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{statusCounts.CONFIRMED || 0}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Completed</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{statusCounts.COMPLETED || 0}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Cancelled</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">{statusCounts.CANCELLED || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top-Performing Properties Leaderboard */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <span>Top-Performing Properties Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked by total captured revenue and guest satisfaction ratings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topHotels.map((hotel, idx) => (
            <div 
              key={hotel.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                  idx === 0 ? 'bg-amber-400 text-amber-950 shadow-xs' :
                  idx === 1 ? 'bg-slate-200 text-slate-800' :
                  idx === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{hotel.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>{hotel.place}</span>
                    <span>•</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star size={11} className="fill-amber-500" />
                      <span className="ml-0.5">{hotel.avgRating}</span>
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  ₹{Number(hotel.revenue).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {hotel.bookings} bookings
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
