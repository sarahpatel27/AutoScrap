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

  const login = async (email, password, city = null) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const cleanEmail = email.toLowerCase().trim();
    let role = 'Super Admin';
    let assignedCity = city;

    // Detect city dealer from email if city not passed
    if (!assignedCity) {
      if (cleanEmail.includes('london')) assignedCity = 'London';
      else if (cleanEmail.includes('manchester')) assignedCity = 'Manchester';
      else if (cleanEmail.includes('doncaster')) assignedCity = 'Doncaster';
      else if (cleanEmail.includes('leicester')) assignedCity = 'Leicester';
      else if (cleanEmail.includes('peterborough')) assignedCity = 'Peterborough';
      else if (cleanEmail.includes('cambridge')) assignedCity = 'Cambridge';
      else if (cleanEmail.includes('liverpool')) assignedCity = 'Liverpool';
    }

    if (assignedCity) {
      role = 'City Dealer';
    }

    const userData = {
      id: `dealer_${assignedCity || 'super'}`,
      name: assignedCity ? `${assignedCity} Dealer` : 'Super Administrator',
      email: cleanEmail,
      role,
      assignedCity,
      avatar: assignedCity ? '📍' : '🛡️',
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
