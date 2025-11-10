'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

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

  // For auth routes, render with dark background and centering
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
  return <>{children}</>;
}
