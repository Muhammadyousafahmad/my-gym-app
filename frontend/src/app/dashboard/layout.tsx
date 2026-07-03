'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#ff6b35]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#ff6b35] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-zinc-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Loading Olympus Portal...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex bg-[#050507] min-h-screen">
      {/* Sidebar - static on desk, toggleable later if needed */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <main className="p-8 flex-1 min-h-[calc(100vh-80px)] text-zinc-200">
          {children}
        </main>
      </div>
    </div>
  );
}
