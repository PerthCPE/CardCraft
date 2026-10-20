'use client';

// ============================================================================
// frontend/src/providers/QueryProvider.tsx
// TanStack Query Client Provider สำหรับ CardCraft
// - ควบคุม In-Memory Caching และ Stale-While-Revalidate (SWR)
// - ป้องกัน Duplicate Requests ระหว่างสลับหน้า
// - รองรับ Fast Fallback แสดงข้อมูล Local Data ทันที
// ============================================================================

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            // ข้อมูลทั่วไปคงสถานะ Fresh ไว้อย่างน้อย 5 นาที
            staleTime: 5 * 60 * 1000,
            // เก็บ Garbage Collection ไว้ในหน่วยความจำ 15 นาที
            gcTime: 15 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
