import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext.jsx';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('hotelier_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hotelier_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  const isSaved = (hotelId) => {
    return wishlist.some((item) => (item.id === hotelId || item.id === String(hotelId)));
  };

  const toggleWishlist = (hotel) => {
    if (!hotel || !hotel.id) return;
    const exists = isSaved(hotel.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== hotel.id));
      toast.info(`Removed "${hotel.name}" from your saved stays.`);
    } else {
      setWishlist((prev) => [
        ...prev,
        {
          id: hotel.id,
          name: hotel.name,
          place_name: hotel.place_name,
          address: hotel.address,
          image_url: hotel.image_url,
          images: hotel.images || [hotel.image_url],
          star_rating: hotel.star_rating,
          average_rating: hotel.average_rating || hotel.star_rating || 4.5,
          min_price: hotel.min_price || 2000,
          amenities: hotel.amenities || []
        }
      ]);
      toast.success(`Saved "${hotel.name}" to your wishlist! ❤️`);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.info('Cleared your saved wishlist.');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
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
