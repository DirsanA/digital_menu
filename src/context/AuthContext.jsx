'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setLogoutCallback } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, tenantSlug) => {
    const body = { email, password };
    if (tenantSlug) body.tenantSlug = tenantSlug;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const { accessToken, refreshToken, user: userData } = data.data;
    localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === 'super_admin';
  const isManager = user?.role === 'manager';
  const canManage = isSuperAdmin || isManager;

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated, login, logout,
      isSuperAdmin, isManager, canManage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
