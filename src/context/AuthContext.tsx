import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, StudentProfile, NotificationItem } from '../types.js';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isLoading: boolean;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  loginAsDemoStudent: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (e) {
      // ignore
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    const currentToken = getStoredToken();
    const isLoggedOut = sessionStorage.getItem('skilltrack_logged_out') === 'true';

    // If no token exists and user hasn't explicitly logged out in this session, auto-login as demo student
    if (!currentToken) {
      if (!isLoggedOut) {
        try {
          const res = await api.login({ email: 'student@skilltrack.ai', password: 'password123' });
          setStoredToken(res.token);
          setToken(res.token);
          setUser(res.user);
          setProfile(res.profile);
          await fetchNotifications();
          return;
        } catch (e) {
          console.warn('Auto-login as demo student failed:', e);
        }
      }
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      await fetchNotifications();
    } catch (err) {
      console.warn('Failed to restore session, re-authenticating as demo student:', err);
      // Attempt recovery login as demo student
      try {
        const res = await api.login({ email: 'student@skilltrack.ai', password: 'password123' });
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        await fetchNotifications();
      } catch (loginErr) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    sessionStorage.removeItem('skilltrack_logged_out');
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      await fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    sessionStorage.removeItem('skilltrack_logged_out');
    try {
      const res = await api.register(data);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      await fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.setItem('skilltrack_logged_out', 'true');
    clearStoredToken();
    setToken(null);
    setUser(null);
    setProfile(null);
    setNotifications([]);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const loginAsDemoStudent = async () => {
    await login('student@skilltrack.ai', 'password123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@skilltrack.ai', 'admin123');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        notifications,
        unreadNotificationCount,
        login,
        register,
        logout,
        refreshUserData,
        markNotificationAsRead,
        loginAsDemoStudent,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
