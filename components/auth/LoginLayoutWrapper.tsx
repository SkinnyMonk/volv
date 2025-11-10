'use client';

import { AuthProvider } from '@/lib/auth/AuthContext';
import { ReactNode } from 'react';

export function LoginLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}
