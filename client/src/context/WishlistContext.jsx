import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext.jsx';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { toast } = useToast();
  const { isAuthenticated, token } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('hotelier_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const syncedWithCloud = useRef(false);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem('hotelier_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  // Sync with Cloud on user sign-in
  useEffect(() => {
    if (isAuthenticated && !syncedWithCloud.current) {
      syncedWithCloud.current = true;
      syncWishlistWithCloud();
    } else if (!isAuthenticated) {
      syncedWithCloud.current = false;
    }
  }, [isAuthenticated, token]);

  const syncWishlistWithCloud = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Batch sync local items to cloud
      const res = await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ localItems: wishlist })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
        }
      }
    } catch (e) {
      console.warn('Cloud wishlist sync deferred:', e);
    }
  };

  const isSaved = (hotelId) => {
    return wishlist.some((item) => (item.id === hotelId || item.id === String(hotelId)));
  };

  const toggleWishlist = async (hotel) => {
    if (!hotel || !hotel.id) return;
    const exists = isSaved(hotel.id);

    if (exists) {
      // Remove
      setWishlist((prev) => prev.filter((item) => item.id !== hotel.id));
      toast.info(`Removed "${hotel.name}" from your saved stays.`);

      if (isAuthenticated) {
        try {
          const headers = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          await fetch(`/api/wishlist/${hotel.id}`, {
            method: 'DELETE',
            headers,
            credentials: 'include'
          });
        } catch (e) {
          console.error('Failed to remove from cloud wishlist:', e);
        }
      }
    } else {
      // Add
      const itemToSave = {
        id: hotel.id,
        name: hotel.name,
        place_name: hotel.place_name,
        place_state: hotel.place_state,
        address: hotel.address,
        image_url: hotel.image_url,
        images: hotel.images || [hotel.image_url],
        star_rating: hotel.star_rating,
        average_rating: hotel.average_rating || hotel.star_rating || 4.5,
        min_price: hotel.min_price || 2500,
        amenities: hotel.amenities || []
      };

      setWishlist((prev) => [...prev, itemToSave]);
      toast.success(
        isAuthenticated 
          ? `Saved "${hotel.name}" to cloud wishlist! ☁️❤️` 
          : `Saved "${hotel.name}" to wishlist! ❤️`
      );

      if (isAuthenticated) {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          await fetch(`/api/wishlist/${hotel.id}`, {
            method: 'POST',
            headers,
            credentials: 'include'
          });
        } catch (e) {
          console.error('Failed to add to cloud wishlist:', e);
        }
      }
    }
  };

  const clearWishlist = async () => {
    const previous = [...wishlist];
    setWishlist([]);
    toast.info('Cleared your saved wishlist.');

    if (isAuthenticated) {
      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await Promise.all(
          previous.map((item) =>
            fetch(`/api/wishlist/${item.id}`, {
              method: 'DELETE',
              headers,
              credentials: 'include'
            })
          )
        );
      } catch (e) {
        console.error('Failed to clear cloud wishlist:', e);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isCloudSynced: Boolean(isAuthenticated),
        isSaved,
        toggleWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
