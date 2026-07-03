'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../lib/store';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CalendarDays, 
  ScanLine, 
  CreditCard, 
  Megaphone, 
  UserCircle,
  Apple,
  ClipboardList,
  LogOut,
  Bell
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = user?.role || 'member';

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'trainer', 'member']
    },
    {
      name: 'Members',
      href: '/dashboard/members',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Assigned Members',
      href: '/dashboard/members',
      icon: Users,
      roles: ['trainer']
    },
    {
      name: 'Trainer Registry',
      href: '/dashboard/trainers',
      icon: Dumbbell,
      roles: ['admin']
    },
    {
      name: 'Class Schedule',
      href: '/dashboard/classes',
      icon: CalendarDays,
      roles: ['admin', 'trainer', 'member']
    },
    {
      name: 'Workout Plans',
      href: '/dashboard/workout-plans',
      icon: ClipboardList,
      roles: ['trainer', 'member']
    },
    {
      name: 'Diet Plans',
      href: '/dashboard/diet-plans',
      icon: Apple,
      roles: ['trainer', 'member']
    },
    {
      name: 'QR Check-in',
      href: '/dashboard/attendance/scanner',
      icon: ScanLine,
      roles: ['admin', 'trainer']
    },
    {
      name: 'My Attendance QR',
      href: '/dashboard/attendance/my-qr',
      icon: ScanLine,
      roles: ['member']
    },
    {
      name: 'Attendance Log',
      href: '/dashboard/attendance',
      icon: ClipboardList,
      roles: ['admin', 'trainer', 'member']
    },
    {
      name: 'Payments & Billings',
      href: '/dashboard/payments',
      icon: CreditCard,
      roles: ['admin', 'member']
    },
    {
      name: 'Broadcast Alert',
      href: '/dashboard/notifications/broadcast',
      icon: Megaphone,
      roles: ['admin', 'trainer']
    },
    {
      name: 'Profile Settings',
      href: '/dashboard/profile',
      icon: UserCircle,
      roles: ['admin', 'trainer', 'member']
    }
  ];

  // Filter items matching user's role
  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 h-screen bg-[#0D0D11] border-r border-zinc-800/40 flex flex-col justify-between p-5 text-zinc-400">
      <div>
        {/* Gym Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#ff6b35] to-[#dd4b1a] flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(255,107,53,0.4)]">
            Ω
          </div>
          <span className="font-extrabold text-white tracking-widest text-lg font-sans">
            OLYMPUS<span className="text-[#ff6b35]">GYM</span>
          </span>
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1.5">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-zinc-800/50 text-white border-l-4 border-[#ff6b35] shadow-[inset_4px_0_15px_-4px_rgba(255,107,53,0.2)]' 
                    : 'hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#ff6b35]' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <button
        onClick={logout}
        className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-zinc-500 text-left w-full mt-auto"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
