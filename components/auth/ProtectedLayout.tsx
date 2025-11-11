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
      console.log('📄 Auth route detected:', pathname);
      return;
    }

    // Check if there's an auth token in localStorage (persisted auth)
    const hasAuthToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');
    
    console.log('🔐 Protected route access:', { 
      pathname, 
      isAuthenticated, 
      hasAuthToken,
      shouldAllow: isAuthenticated || hasAuthToken 
    });
    
    // Only redirect if BOTH conditions are true:
    // 1. isAuthenticated is false (state not hydrated)
    // 2. AND no auth token in localStorage (actually logged out)
    if (!isAuthenticated && !hasAuthToken) {
      console.log('❌ Access denied - no auth token found, redirecting to login...');
      router.replace('/auth/login');
    } else if (!isAuthenticated && hasAuthToken) {
      console.log('⏳ Access allowed (token exists) - waiting for auth hydration...');
      // Don't redirect - let hydration finish
    } else {
      console.log('✅ Access granted - user authenticated');
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

  // Render protected content with header/sidebar
  // The useEffect above will handle redirects if not authenticated
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
