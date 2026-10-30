import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Helper to make API requests with credentials and optional token
async function apiFetch(url, options = {}) {
  const { token, ...fetchOpts } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...fetchOpts,
    headers,
    credentials: 'include'
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Failed to fetch ${url}`);
  }

  return data;
}

// 1. Places Query
export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const data = await apiFetch('/api/hotels/places');
      return data.places || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

// 2. Categories Query
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await apiFetch('/api/rooms/categories');
      return data.categories || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// 3. Hotels Listing Query with reactive filters
export function useHotels(filters = {}) {
  const {
    placeId = '',
    minRating = '',
    search = '',
    maxPrice = 15000,
    amenities = [],
    checkIn = '',
    checkOut = '',
    guests = '2'
  } = filters;

  return useQuery({
    queryKey: ['hotels', { placeId, minRating, search, maxPrice, amenities, checkIn, checkOut, guests }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (placeId) params.append('placeId', placeId);
      if (minRating) params.append('minRating', minRating);
      if (search && search.trim()) params.append('search', search.trim());
      if (maxPrice && Number(maxPrice) < 15000) params.append('maxPrice', maxPrice);
      if (amenities && amenities.length > 0) params.append('amenities', amenities.join(','));
      if (checkIn && checkOut) {
        params.append('checkIn', checkIn);
        params.append('checkOut', checkOut);
      }
      if (guests) params.append('guests', guests);

      const data = await apiFetch(`/api/hotels?${params.toString()}`);
      return data.hotels || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// 4. Hotel Details Query
export function useHotelDetails(id) {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const data = await apiFetch(`/api/hotels/${id}`);
      return data.hotel || null;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

// 5. Hotel Rooms Query (with dates & filters)
export function useHotelRooms(hotelId, filters = {}) {
  const { checkIn, checkOut, ac, beds } = filters;

  return useQuery({
    queryKey: ['rooms', hotelId, { checkIn, checkOut, ac, beds }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      if (ac) params.append('ac', ac);
      if (beds) params.append('beds', beds);

      const data = await apiFetch(`/api/rooms/hotel/${hotelId}?${params.toString()}`);
      return data.rooms || [];
    },
    enabled: Boolean(hotelId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// 6. Hotel Reviews Query
export function useHotelReviews(hotelId) {
  return useQuery({
    queryKey: ['reviews', hotelId],
    queryFn: async () => {
      const data = await apiFetch(`/api/reviews/hotel/${hotelId}`);
      return {
        reviews: data.reviews || [],
        stats: data.stats || { averageRating: 0, totalReviews: 0 }
      };
    },
    enabled: Boolean(hotelId),
    staleTime: 60 * 1000,
  });
}

// 7. My Bookings Query
export function useMyBookings(token, enabled = true) {
  return useQuery({
    queryKey: ['my-bookings', token],
    queryFn: async () => {
      const data = await apiFetch('/api/reservations/my', { token });
      return data.reservations || [];
    },
    enabled: Boolean(enabled),
    staleTime: 30 * 1000,
  });
}

// 8. Admin Statistics & KPI Query
export function useAdminStats(token, enabled = true) {
  return useQuery({
    queryKey: ['admin-stats', token],
    queryFn: async () => {
      const data = await apiFetch('/api/admin/stats', { token });
      return data.stats || null;
    },
    enabled: Boolean(enabled),
    staleTime: 30 * 1000,
  });
}

// 9. Admin Analytics & Trend Charts Query
export function useAdminAnalytics(token, enabled = true) {
  return useQuery({
    queryKey: ['admin-analytics', token],
    queryFn: async () => {
      const data = await apiFetch('/api/admin/analytics', { token });
      return data.analytics || null;
    },
    enabled: Boolean(enabled),
    staleTime: 60 * 1000,
  });
}

// 10. Admin Rooms Inventory Query
export function useAdminRooms(token, hotelId = '', enabled = true) {
  return useQuery({
    queryKey: ['admin-rooms', token, hotelId],
    queryFn: async () => {
      const url = hotelId ? `/api/admin/rooms?hotelId=${hotelId}` : '/api/admin/rooms';
      const data = await apiFetch(url, { token });
      return data.rooms || [];
    },
    enabled: Boolean(enabled),
    staleTime: 30 * 1000,
  });
}

// 11. Admin All Reservations Query
export function useAdminReservations(token, enabled = true) {
  return useQuery({
    queryKey: ['admin-reservations', token],
    queryFn: async () => {
      const data = await apiFetch('/api/admin/reservations', { token });
      return data.reservations || [];
    },
    enabled: Boolean(enabled),
    staleTime: 30 * 1000,
  });
}
