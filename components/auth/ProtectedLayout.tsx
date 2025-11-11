'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, Suspense } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't protect auth routes
    if (pathname?.startsWith('/auth')) {
      return;
    }

    // Protect non-auth routes
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router, pathname]);

  // For auth routes, render with dark background and centering (no header/sidebar)
  if (pathname?.startsWith('/auth')) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        {children}
      </div>
    );
  }

  // For protected routes, show loading while checking auth
  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen" />;
  }

  // Render protected content with header/sidebar
  return (
    <>
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<div className="w-full h-full" />}>
            {children}
          </Suspense>
        </main>
      </div>
    </>
  );
}
