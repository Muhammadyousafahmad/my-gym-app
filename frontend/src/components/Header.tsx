'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../lib/store';
import API, { BASE_URL } from '../lib/api';
import { Bell, UserCircle, CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Translate paths into readable titles
  const getPageTitle = () => {
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];
    
    if (last === 'dashboard') return 'Dashboard Overview';
    if (last === 'members') return 'Members Directory';
    if (last === 'trainers') return 'Trainer Roster';
    if (last === 'classes') return 'Group Class Bookings';
    if (last === 'workout-plans') return 'My Workouts';
    if (last === 'diet-plans') return 'Nutritional Diet Sheet';
    if (last === 'my-qr') return 'Attendance Scan Code';
    if (last === 'scanner') return 'Attendance QR Scanner';
    if (last === 'attendance') return 'Check-In Records';
    if (last === 'payments') return 'Billing & Invoices';
    if (last === 'broadcast') return 'Public Announcements';
    if (last === 'profile') return 'My Profile Profile';
    
    return 'Olympus Center';
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await API.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 45 seconds
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside notification panel listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-[#09090b]/40 backdrop-blur-md border-b border-zinc-800/40 flex items-center justify-between px-8 text-white sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold font-sans tracking-wide text-zinc-100 uppercase">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-zinc-500 hidden sm:block">
          Welcome back, {user?.name} ({user?.role})
        </p>
      </div>

      <div className="flex items-center gap-6 relative">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 rounded-full hover:bg-zinc-800/60 transition-all border border-zinc-800/50 hover:border-zinc-700/50 text-zinc-400 hover:text-white"
          >
            <Bell className="w-5.5 h-5.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#ff6b35] text-[10px] font-bold rounded-full flex items-center justify-center text-white scale-90 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown panel */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-[#121217] border border-zinc-800 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
                <span className="font-semibold text-sm">Notifications</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {unreadCount} New
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.read && markAsRead(notif._id)}
                      className={`px-5 py-3.5 border-b border-zinc-900 cursor-pointer transition-colors flex flex-col gap-1 ${
                        notif.read ? 'bg-transparent hover:bg-zinc-900/30' : 'bg-zinc-850/60 hover:bg-zinc-800/40 border-l-2 border-[#ff6b35]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-zinc-200">{notif.title}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">{notif.message}</p>
                      <span className="text-[9px] text-zinc-600 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-zinc-200 leading-none mb-1">{user?.name}</p>
            <span className="text-[10px] text-[#ff6b35] font-bold tracking-widest uppercase">
              {user?.role}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full border border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center">
            {user?.photo ? (
              <img
                src={user.photo.startsWith('uploads') ? `${BASE_URL}/${user.photo}` : user.photo}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMyZDJkMmQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgc3R5bGU9ImZpbGw6I2NjYztmb250LXNpemU6MjRweDt0ZXh0LWFuY2hvci1tZWRpdW07Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjsgc3R5bGU9ImZpbGw6I2NjYyI+Pz88L3RleHQ+PC9zdmc+';
}}
              />
            ) : (
              <UserCircle className="w-7 h-7 text-zinc-600" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
