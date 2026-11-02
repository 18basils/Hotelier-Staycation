import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    rate: 1.0,
    name: 'Indian Rupee',
    flag: '🇮🇳',
    locale: 'en-IN',
    fractionDigits: 0
  },
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 0.012,
    name: 'US Dollar',
    flag: '🇺🇸',
    locale: 'en-US',
    fractionDigits: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 0.011,
    name: 'Euro',
    flag: '🇪🇺',
    locale: 'de-DE',
    fractionDigits: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rate: 0.0094,
    name: 'British Pound',
    flag: '🇬🇧',
    locale: 'en-GB',
    fractionDigits: 2
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    rate: 0.044,
    name: 'UAE Dirham',
    flag: '🇦🇪',
    locale: 'en-AE',
    fractionDigits: 2
  }
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    try {
      const saved = localStorage.getItem('hotelier_currency');
      return (saved && CURRENCIES[saved]) ? saved : 'INR';
    } catch {
      return 'INR';
    }
  });

  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;

  useEffect(() => {
    try {
      localStorage.setItem('hotelier_currency', currencyCode);
    } catch (e) {
      console.error('Failed to save currency preference:', e);
    }
  }, [currencyCode]);

  /**
   * Convert an amount from base INR to the selected currency
   */
  const convertPrice = (inrAmount) => {
    const num = Number(inrAmount) || 0;
    return Math.round(num * currency.rate * 100) / 100;
  };

  /**
   * Format an amount from base INR into localized currency string with symbol
   */
  const formatPrice = (inrAmount, options = {}) => {
    const converted = convertPrice(inrAmount);
    const { showCode = false, compact = false } = options;

    if (currency.code === 'INR') {
      const formatted = Math.round(converted).toLocaleString('en-IN');
      return `${currency.symbol}${formatted}${showCode ? ' INR' : ''}`;
    }

    const formatted = converted.toLocaleString(currency.locale, {
      minimumFractionDigits: currency.fractionDigits,
      maximumFractionDigits: currency.fractionDigits
    });

    return `${currency.symbol}${formatted}${showCode ? ` ${currency.code}` : ''}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencyCode,
      setCurrency: setCurrencyCode,
      currencies: Object.values(CURRENCIES),
      convertPrice,
      formatPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
