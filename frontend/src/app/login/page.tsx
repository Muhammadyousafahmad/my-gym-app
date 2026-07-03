'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading, error, checkAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login({ email, password });
    if (success) {
      router.push('/dashboard');
    }
  };

  // Pre-fill demo accounts helper
  const handleQuickLogin = async (role: 'admin' | 'trainer' | 'member') => {
    let demoEmail = '';
    const demoPassword = 'password123';

    if (role === 'admin') {
      demoEmail = 'admin@gym.com';
    } else if (role === 'trainer') {
      demoEmail = 'trainer1@gym.com';
    } else {
      demoEmail = 'member1@gym.com';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);

    const success = await login({ email: demoEmail, password: demoPassword });
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6b35]/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#39ff14]/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff6b35] to-[#dd4b1a] flex items-center justify-center text-white font-bold text-3xl shadow-[0_0_20px_rgba(255,107,53,0.5)] mb-3">
            Ω
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest font-sans uppercase">
            OLYMPUS<span className="text-[#ff6b35]">GYM</span>
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Management & Fitness Portal</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full h-12 rounded-xl pl-12 pr-4 text-sm glass-input text-white"
                required
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                Password
              </label>
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 rounded-xl pl-12 pr-4 text-sm glass-input text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 btn-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fills */}
        <div className="mt-8 border-t border-zinc-800/60 pt-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 text-center mb-3.5">
            Quick Demo Login Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-800 transition-colors uppercase cursor-pointer"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickLogin('trainer')}
              className="py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-[#ff6b35]/80 hover:text-[#ff6b35] border border-zinc-800 transition-colors uppercase cursor-pointer"
            >
              Trainer
            </button>
            <button
              onClick={() => handleQuickLogin('member')}
              className="py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-800 transition-colors uppercase cursor-pointer"
            >
              Member
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#ff6b35] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
