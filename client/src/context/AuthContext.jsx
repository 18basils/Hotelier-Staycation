import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hotelier_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Access token kept in memory for dual-mode authorization (headers + HttpOnly cookies)
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  // Sync user profile cache to localStorage (excluding sensitive JWT tokens)
  useEffect(() => {
    if (user) {
      localStorage.setItem('hotelier_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hotelier_user');
    }
    // Clean up any legacy token stored in localStorage for enhanced XSS protection
    localStorage.removeItem('hotelier_token');
  }, [user]);

  // Silent token refresh using HttpOnly refresh cookie
  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token && data?.user) {
          setUser(data.user);
          setToken(data.token);
          return data.token;
        }
      }
    } catch {
      // Refresh failed or network error
    }
    return null;
  }, []);

  // Initialize session: check current session via HttpOnly cookie or silent refresh
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.user) {
            setUser(data.user);
          }
        } else if (res.status === 401 || res.status === 403) {
          // Access token might be expired, attempt refresh token rotation
          const newToken = await refreshToken();
          if (!newToken && isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } catch {
        // Network failure on init
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    setToken(data.token);
    setAuthModalOpen(false);
    return data.user;
  };

  const register = async (username, password, email, fullName) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password, email, fullName })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setUser(data.user);
    setToken(data.token);
    setAuthModalOpen(false);
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Ignore network errors on logout
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('hotelier_user');
    localStorage.removeItem('hotelier_token');
    sessionStorage.clear();
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      refreshToken,
      authModalOpen,
      setAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      openLoginModal,
      openRegisterModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
