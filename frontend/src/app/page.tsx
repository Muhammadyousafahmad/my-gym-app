'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-[#ff6b35]/30 border-t-[#ff6b35] rounded-full animate-spin"></span>
    </div>
  );
}
