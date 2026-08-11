import { createContext, useContext, useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'autoscrap_admin_auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login simulation with short delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Allow standard admin credentials or any reasonable input for testing
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    if (password.length < 5) {
      throw new Error('Password must be at least 5 characters long.');
    }

    const userData = {
      id: 'admin_1',
      name: 'Site Administrator',
      email: email.toLowerCase(),
      role: 'Super Admin',
      avatar: '🛡️',
      loggedInAt: new Date().toISOString(),
    };

    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = {
    user,
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
