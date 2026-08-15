import { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { setCookie, getCookie, deleteCookie } from '../utils/cookieHelper';

const TOKEN_COOKIE_KEY = 'autoscrap_admin_token';
const USER_COOKIE_KEY = 'autoscrap_admin_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Clean up legacy localStorage if present
      try {
        localStorage.removeItem('autoscrap_admin_token');
        localStorage.removeItem('autoscrap_admin_user');
      } catch (e) {}

      const token = getCookie(TOKEN_COOKIE_KEY);
      const storedUserRaw = getCookie(USER_COOKIE_KEY);

      if (token && storedUserRaw) {
        try {
          const parsedUser = JSON.parse(storedUserRaw);
          setUser(parsedUser);

          // Validate token with backend /api/auth/me
          const res = await fetch(getApiUrl('/api/auth/me'), {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setCookie(USER_COOKIE_KEY, JSON.stringify(data.user), 7);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Auth token validation warning:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, city = null) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, city }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed.');
    }

    setCookie(TOKEN_COOKIE_KEY, data.token, 7);
    setCookie(USER_COOKIE_KEY, JSON.stringify(data.user), 7);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    deleteCookie(TOKEN_COOKIE_KEY);
    deleteCookie(USER_COOKIE_KEY);
    try {
      localStorage.removeItem('autoscrap_admin_token');
      localStorage.removeItem('autoscrap_admin_user');
    } catch (e) {}
  };

  const value = {
    user,
    token: getCookie(TOKEN_COOKIE_KEY),
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
