'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ADMIN_STORAGE_KEY = 'biolt-admin-mode';
const ADMIN_PASSWORD = 'ssamzzi';

type AdminContextValue = {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    setIsAdmin(stored === 'true');
  }, []);

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        window.dispatchEvent(new Event('biolt-admin-change'));
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      window.dispatchEvent(new Event('biolt-admin-change'));
    }
  };

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used inside <AdminProvider>');
  }
  return ctx;
}

