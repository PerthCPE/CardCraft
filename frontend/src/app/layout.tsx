// ============================================================================
// frontend/src/app/layout.tsx
// Root Layout ของ Next.js (App Router)
//
// การจัดระบบฟอนต์ตามหลักการของ frontend-design + cardcraft-pixel-ui:
// 1. Plus Jakarta Sans + IBM Plex Sans Thai (--font-body / --font-ibm-thai):
//    ใช้เป็นฟอนต์หลักสำหรับเนื้อหาภาษาอังกฤษและภาษาไทย อ่านง่าย สบายตา ความยาวบรรทัด < 75 ตัวอักษร
// 2. Chakra Petch (--font-display):
//    ใช้เฉพาะหัวข้อหลัก (Headings) เพื่อคุมโทนเกม RPG เชิงกลยุทธ์โดยไม่รบกวนสายตาเวลาอ่านโจทย์ยาวๆ
// 3. Silkscreen (--font-pixel):
//    ใช้เฉพาะตัวเลขคะแนน (625 / 990), ตัวจับเวลา (14:59) และป้ายระดับสั้นๆ เท่านั้น
// ============================================================================

import type { Metadata } from 'next';
import {
  Chakra_Petch,
  IBM_Plex_Sans_Thai,
  Plus_Jakarta_Sans,
  Silkscreen,
} from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import QueryProvider from '@/providers/QueryProvider';

const AuthModal = dynamic(() => import('@/components/AuthModal'), {
  ssr: false,
  loading: () => null,
});

const silkscreen = Silkscreen({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const chakraPetch = Chakra_Petch({
  weight: ['500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-display',
  display: 'swap',
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-ibm-thai',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CardCraft — ระบบฝึกคำศัพท์และพิชิตข้อสอบ TOEIC 700+',
  description:
    'เว็บแอปพลิเคชันเตรียมสอบ TOEIC 700+ สไตล์ Pixel-Art RPG พร้อมคลังคำศัพท์ธุรกิจ 60 คำ และระบบจำลองสอบจับเวลา',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${silkscreen.variable} ${chakraPetch.variable} ${ibmPlexSansThai.variable} ${plusJakartaSans.variable} overflow-x-hidden`}
    >
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-900 selection:bg-amber-300 selection:text-slate-950 overflow-x-hidden">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {children}
            </main>
            <AuthModal />
            <footer className="bg-slate-900 text-slate-300 border-t-2 border-slate-950 py-6 mt-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src="/icons/icon-logo.png"
                    alt="CardCraft"
                    className="w-5 h-5 [image-rendering:pixelated]"
                  />
                  <span className="font-display font-bold text-amber-400 tracking-tight">
                    CardCraft
                  </span>
                  <span className="text-slate-400 text-xs">
                    โปรเจกต์รายวิชาวิศวกรรมซอฟต์แวร์ (Next.js App Router, NestJS, Prisma ORM)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>เป้าหมายคะแนนมาตรฐาน</span>
                  <span className="font-pixel text-emerald-400 px-2 py-0.5 bg-slate-800 border border-slate-700">
                    700+
                  </span>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
