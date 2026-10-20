'use client';

// ============================================================================
// AuthContext.tsx
// Context จัดการสถานะการเข้าสู่ระบบ (Authentication) ของผู้เล่น CardCraft
// รองรับ:
// - เข้าสู่ระบบด้วย Username + Password แบบง่าย
// - สมัครสมาชิกผู้เล่นใหม่ (แยกคะแนน, Tier, สถิติการปัดการ์ด และประวัติการสอบเฉพาะตัว)
// - สลับบัญชีผู้เล่น / ออกจากระบบ
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authGetMe, authLogin, authRegister, HeroUserProfile } from '@/lib/api';

interface AuthContextType {
  user: HeroUserProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    name?: string,
    targetScore?: number,
  ) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
}

const STORAGE_AUTH_USER_KEY = 'cardcraft_auth_user_v2';

const DEFAULT_DEMO_USER: HeroUserProfile = {
  id: 'demo-hero-1',
  username: 'hero',
  name: 'Alden the Rune Challenger',
  email: 'hero@cardcraft.dev',
  targetScore: 700,
  currentEstimatedScore: 625,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HeroUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // โหลดผู้ใช้ที่บันทึกไว้ใน LocalStorage เมื่อเปิดแอป
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HeroUserProfile;
        setUser(parsed);
      } else {
        // ค่าเริ่มต้นเป็น Demo Hero เพื่อให้พร้อมทดสอบได้ทันที
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem(
          STORAGE_AUTH_USER_KEY,
          JSON.stringify(DEFAULT_DEMO_USER),
        );
      }
    } catch {
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authLogin(username, password);
    setUser(res.user);
    localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
    setIsAuthModalOpen(false);
  };

  const register = async (
    username: string,
    password: string,
    name?: string,
    targetScore?: number,
  ) => {
    const res = await authRegister(username, password, name, targetScore);
    setUser(res.user);
    localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_AUTH_USER_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await authGetMe(user.id);
      setUser(res.user);
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        refreshUser,
      }}
    >
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
