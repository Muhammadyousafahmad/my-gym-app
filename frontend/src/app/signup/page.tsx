'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store';
import { LogIn, Key, Mail, ShieldAlert, User, Phone, Calendar, Heart } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, loading, error, checkAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [fitnessGoal, setFitnessGoal] = useState('Lose Weight');

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
    if (!name || !email || !password) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('fitnessGoal', fitnessGoal);
    formData.append('role', 'member'); // Default role for public registration

    const success = await signup(formData);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6b35]/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#39ff14]/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl relative z-10 my-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff6b35] to-[#dd4b1a] flex items-center justify-center text-white font-bold text-3xl shadow-[0_0_20px_rgba(255,107,53,0.5)] mb-3">
            Ω
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest font-sans uppercase">
            OLYMPUS<span className="text-[#ff6b35]">GYM</span>
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Create Member Account</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-11 rounded-xl pl-11 pr-4 text-sm glass-input text-white"
                  required
                />
              </div>
            </div>

            <div>
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
                  className="w-full h-11 rounded-xl pl-11 pr-4 text-sm glass-input text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl pl-11 pr-4 text-sm glass-input text-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-11 rounded-xl pl-11 pr-4 text-sm glass-input text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-11 rounded-xl pl-11 pr-4 text-sm glass-input text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 rounded-xl px-4 text-sm glass-input text-white bg-[#0D0D11]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
              Fitness Goal
            </label>
            <div className="relative">
              <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full h-11 rounded-xl pl-11 pr-4 text-sm glass-input text-white bg-[#0D0D11]"
              >
                <option value="Lose Weight">Lose Weight (Fat Loss)</option>
                <option value="Build Muscle">Build Muscle (Hypertrophy)</option>
                <option value="Improve Endurance">Improve Endurance (Cardio)</option>
                <option value="Maintain Fitness">Maintain Fitness (Overall Health)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 btn-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <User className="w-4 h-4" />
                Register Membership
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#ff6b35] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
