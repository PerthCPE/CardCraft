'use client';

// ============================================================================
// AuthContext.tsx
// CardCraft Release v1.0: Context จัดการระบบล็อกอินและสิทธิ์การใช้งาน
// - เริ่มต้นที่ Guest Mode เสมอ (ไม่มี Demo Mockup ค้าง)
// - ป้องกันการใช้งานฟีเจอร์สำคัญด้วย helper `requireAuth`
// - รองรับการเข้าสู่ระบบและสมัครสมาชิกจริงด้วย Username + Password
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authGetMe, authLogin, authRegister, HeroUserProfile } from '@/lib/api';

interface AuthContextType {
  user: HeroUserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  authPromptMessage: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    name?: string,
    targetScore?: number,
  ) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (promptMessage?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (action?: () => void, promptMessage?: string) => boolean;
  refreshUser: () => Promise<void>;
}

const STORAGE_AUTH_USER_KEY = 'cardcraft_auth_user_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HeroUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  // โหลดข้อมูลผู้เล่นที่บันทึกไว้ใน LocalStorage (ล้าง demo user เก่าทิ้งทั้งหมด)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HeroUserProfile;
        // ล้างกรณีเป็นข้อมูล mock เดิม
        if (parsed.id === 'demo-hero-1' || parsed.username === 'hero') {
          localStorage.removeItem(STORAGE_AUTH_USER_KEY);
          setUser(null);
        } else {
          setUser(parsed);
        }
      } else {
        setUser(null); // เริ่มต้นเป็น Guest Mode ตามข้อกำหนด
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authLogin(username, password);
    setUser(res.user);
    localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
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
    setAuthPromptMessage(null);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_AUTH_USER_KEY);
    setUser(null);
  };

  const openAuthModal = (promptMessage?: string) => {
    if (promptMessage) {
      setAuthPromptMessage(promptMessage);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
  };

  /**
   * Helper ตรวจสอบสิทธิ์การใช้งาน
   * - หากล็อกอินแล้ว: รัน action() ทันที และคืนค่า true
   * - หากเป็น Guest: เปิด AuthModal พร้อมแจ้งเหตุผล และคืนค่า false
   */
  const requireAuth = (action?: () => void, promptMessage?: string): boolean => {
    if (user) {
      if (action) action();
      return true;
    }
    openAuthModal(
      promptMessage ||
        'กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนเริ่มใช้งาน เพื่อบันทึกคะแนนและพัฒนาการของฮีโร่คุณ',
    );
    return false;
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await authGetMe(user.id);
      setUser(res.user);
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(res.user));
    } catch {
      // ignore network errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest: !user,
        authPromptMessage,
        login,
        register,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        requireAuth,
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
