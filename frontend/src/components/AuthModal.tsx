'use client';

// ============================================================================
// AuthModal.tsx
// หน้าต่างเข้าสู่ระบบ / สมัครสมาชิกแบบง่าย (Simple Username + Password)
// รองรับ:
// - แท็บ Login & Register
// - ปุ่ม 1-Click Demo Login (เข้าด้วย user 'hero' / '123456')
// - แยกผู้เล่นจริงใน Database โดยตรง
// ============================================================================

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LogOut,
  Shield,
  Sparkles,
  User,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, user, login, register, logout } =
    useAuth();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [targetScore, setTargetScore] = useState<number>(700);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleQuickDemoLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login('hero', '123456');
      setSuccessMsg('เข้าสู่ระบบด้วย Demo Hero สำเร็จ!');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถเข้าสู่ระบบ Demo Hero ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'LOGIN') {
        await login(username.trim(), password.trim());
        setSuccessMsg('เข้าสู่ระบบสำเร็จ!');
      } else {
        await register(
          username.trim(),
          password.trim(),
          name.trim() || undefined,
          targetScore,
        );
        setSuccessMsg('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!');
      }
      setTimeout(() => {
        closeAuthModal();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 border-b-2 border-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border-2 border-slate-900 bg-white flex items-center justify-center shadow-pixel-sm">
              <Shield className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-950">
                {user
                  ? 'ข้อมูลผู้เล่นฮีโร่ (Hero Profile)'
                  : tab === 'LOGIN'
                    ? 'เข้าสู่ระบบ (Hero Login)'
                    : 'สมัครสมาชิก (Create Hero)'}
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                {user ? `กำลังเล่นในชื่อ: ${user.name}` : 'ระบบแยกผู้เล่นเพื่อบันทึกสถิติและ Tier ของคุณ'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1 text-slate-900 hover:bg-white border-2 border-transparent hover:border-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {user ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border-2 border-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">ผู้เล่นปัจจุบัน:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-300 text-slate-950 rounded border border-emerald-600">
                  {user.currentEstimatedScore} pts
                </span>
              </div>
              <div className="font-display font-bold text-lg text-slate-950">
                {user.name}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Username: @{user.username || 'hero'}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setTab('LOGIN');
                }}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ / สลับบัญชี
              </button>

              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-900 font-display font-bold text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          /* Not Logged In -> Tabs */
          <div className="flex flex-col">
            <div className="flex border-b-2 border-slate-900 bg-slate-100 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTab('LOGIN');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-3 px-3 text-center border-r-2 border-slate-900 transition-colors flex items-center justify-center gap-1.5 ${
                  tab === 'LOGIN'
                    ? 'bg-white text-slate-900 font-bold border-b-2 border-b-white -mb-[2px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <User className="w-4 h-4 text-amber-600" />
                เข้าสู่ระบบ (Login)
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('REGISTER');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-3 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
                  tab === 'REGISTER'
                    ? 'bg-white text-slate-900 font-bold border-b-2 border-b-white -mb-[2px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                สมัครสมาชิก (Register)
              </button>
            </div>

            {/* Quick Demo Login Banner */}
            <div className="p-4 bg-amber-50 border-b-2 border-slate-900 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-800 leading-snug">
                <span className="font-bold text-slate-950 block">
                  เข้าใช้งานด่วนด้วย Demo Account:
                </span>
                Username: <code className="bg-white px-1 border">hero</code> | Pass: <code className="bg-white px-1 border">123456</code>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm shrink-0 active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                เข้าสู่ระบบ 1-Click
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border-2 border-rose-500 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  ชื่อผู้ใช้ (Username):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น user1, perth_hero"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-slate-900 text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  รหัสผ่าน (Password):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="รหัสผ่านอย่างน้อย 4 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-slate-900 text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
              </div>

              {/* Register Extra Fields */}
              {tab === 'REGISTER' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                      ชื่อตัวละคร / Display Name (ไม่ระบุก็ได้):
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Rune Knight Perth"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-900 text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                      เป้าหมายคะแนน TOEIC:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[600, 700, 800, 900].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setTargetScore(score)}
                          className={`py-1.5 text-xs font-display font-bold border-2 transition-all ${
                            targetScore === score
                              ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-pixel-sm'
                              : 'bg-white text-slate-600 border-slate-300 hover:border-slate-800'
                          }`}
                        >
                          {score}+
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-sm shadow-pixel active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {tab === 'LOGIN' ? (
                  <>
                    <User className="w-4 h-4 text-slate-950" />
                    เข้าสู่ระบบ
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    สร้างตัวละครและเริ่มเล่น
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
