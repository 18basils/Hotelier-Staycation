import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const ComparisonContext = createContext(null);
const MAX_COMPARISON = 3;

export function ComparisonProvider({ children }) {
  const { toast } = useToast();
  const [comparisonList, setComparisonList] = useState(() => {
    try {
      const saved = localStorage.getItem('hotelier_comparison');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('hotelier_comparison', JSON.stringify(comparisonList));
    } catch (e) {
      console.error('Failed to persist comparison list:', e);
    }
  }, [comparisonList]);

  const isInComparison = (hotelId) => {
    return comparisonList.some((item) => item.id === hotelId || item.id === String(hotelId));
  };

  const addToComparison = (hotel) => {
    if (!hotel || !hotel.id) return;
    if (isInComparison(hotel.id)) return;

    if (comparisonList.length >= MAX_COMPARISON) {
      toast.warning(`You can compare up to ${MAX_COMPARISON} hotels at once. Remove one to add "${hotel.name}".`);
      return;
    }

    setComparisonList((prev) => [...prev, hotel]);
    toast.success(`Added "${hotel.name}" to comparison (${comparisonList.length + 1}/${MAX_COMPARISON})`);
  };

  const removeFromComparison = (hotelId) => {
    setComparisonList((prev) => {
      const target = prev.find((item) => item.id === hotelId);
      if (target) {
        toast.info(`Removed "${target.name}" from comparison`);
      }
      return prev.filter((item) => item.id !== hotelId);
    });
  };

  const toggleComparison = (hotel) => {
    if (!hotel || !hotel.id) return;
    if (isInComparison(hotel.id)) {
      removeFromComparison(hotel.id);
    } else {
      addToComparison(hotel);
    }
  };

  const clearComparison = () => {
    setComparisonList([]);
    setIsDrawerOpen(false);
    toast.info('Cleared comparison list');
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      comparisonCount: comparisonList.length,
      maxAllowed: MAX_COMPARISON,
      isDrawerOpen,
      setIsDrawerOpen,
      isInComparison,
      addToComparison,
      removeFromComparison,
      toggleComparison,
      clearComparison,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false)
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
