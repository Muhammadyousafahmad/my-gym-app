'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store';
import API, { BASE_URL } from '../../lib/api';
import { 
  Users, 
  Dumbbell, 
  DollarSign, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Activity, 
  ShieldAlert,
  ChevronRight,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="w-10 h-10 border-4 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin"></span>
        <span className="text-xs text-zinc-500 mt-3 font-semibold uppercase tracking-wider">Compiling analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const role = user?.role || 'member';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#121217] via-[#1a1a24] to-[#121217] border border-zinc-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#ff6b35]/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-xs font-bold text-[#ff6b35] tracking-widest uppercase mb-2 block">
            Welcome Back to Olympus
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Hello, {user?.name}!
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            {role === 'admin' && 'Track gym earnings, member enrollments, scheduling, and operations from your administrative dashboard.'}
            {role === 'trainer' && 'View your upcoming sessions, client rosters, and monitor progress charts for your assigned members.'}
            {role === 'member' && 'Scan your QR code for entry, follow your workout routines, log your meals, and book your group fitness classes.'}
          </p>
        </div>
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {role === 'admin' && stats && (
        <div className="space-y-8">
          {/* Metrics grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Members</span>
                <p className="text-3xl font-extrabold text-white">{stats.metrics.totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Active Subscriptions</span>
                <p className="text-3xl font-extrabold text-[#39ff14] glow-green">{stats.metrics.activeMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#39ff14]/10 flex items-center justify-center text-[#39ff14]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Trainers</span>
                <p className="text-3xl font-extrabold text-white">{stats.metrics.totalTrainers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                <Dumbbell className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Earnings</span>
                <p className="text-3xl font-extrabold text-[#ff6b35] glow-orange">${stats.metrics.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35]">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth chart */}
            <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">Member Sign-Up Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                    <Area type="monotone" dataKey="members" stroke="#ff6b35" fillOpacity={1} fill="url(#colorMembers)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance share */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">Attendance Breakdown</h3>
              <div className="h-80 flex flex-col items-center justify-center">
                {Object.values(stats.attendance).every(v => v === 0) ? (
                  <p className="text-xs text-zinc-500">No attendance logged yet.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Present', value: stats.attendance.Present },
                            { name: 'Late', value: stats.attendance.Late },
                            { name: 'Absent', value: stats.attendance.Absent }
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#39ff14" />
                          <Cell fill="#ff6b35" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs mt-2">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#39ff14]" /> Present ({stats.attendance.Present})</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff6b35]" /> Late ({stats.attendance.Late})</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent ({stats.attendance.Absent})</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Table grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Class Bookings */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">Class Booking Capacities</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Class Name</th>
                      <th className="pb-3 text-center font-bold">Enrollment Rate</th>
                      <th className="pb-3 text-right">Trainer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.classes.length === 0 ? (
                      <tr><td colSpan={3} className="py-4 text-center text-xs text-zinc-500">No scheduled classes</td></tr>
                    ) : (
                      stats.classes.map((cls: any, i: number) => (
                        <tr key={i} className="border-b border-zinc-900 last:border-0 text-sm">
                          <td className="py-3 font-semibold text-zinc-200">{cls.name}</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs font-semibold">{cls.enrolled}/{cls.capacity}</span>
                              <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#ff6b35] to-[#dd4b1a]" 
                                  style={{ width: `${Math.min(cls.fillRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right text-zinc-400 text-xs">{cls.trainer}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">Recent Billings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Member</th>
                      <th className="pb-3 text-center font-bold">Plan</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPayments.length === 0 ? (
                      <tr><td colSpan={3} className="py-4 text-center text-xs text-zinc-500">No recent transactions</td></tr>
                    ) : (
                      stats.recentPayments.map((pay: any, i: number) => (
                        <tr key={i} className="border-b border-zinc-900 last:border-0 text-sm">
                          <td className="py-3 font-semibold text-zinc-200">{pay.member?.name || 'Deleted User'}</td>
                          <td className="py-3 text-center text-xs text-zinc-400">{pay.plan?.name || 'General'}</td>
                          <td className="py-3 text-right text-[#39ff14] font-semibold">${pay.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRAINER DASHBOARD VIEW */}
      {role === 'trainer' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">My Classes</span>
              <p className="text-3xl font-extrabold text-white">{stats.metrics.totalClasses}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Assigned Clients</span>
              <p className="text-3xl font-extrabold text-white">{stats.metrics.totalMembers}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Active Workout Sheets</span>
              <p className="text-3xl font-extrabold text-[#ff6b35]">{stats.metrics.activeWorkoutPlans}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Active Diet Sheets</span>
              <p className="text-3xl font-extrabold text-[#39ff14]">{stats.metrics.activeDietPlans}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Next session widget */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider mb-4">Upcoming Session</h3>
                {stats.upcomingClass ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{stats.upcomingClass.name}</h4>
                        <span className="text-xs text-zinc-500">Room: {stats.upcomingClass.room}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span>{new Date(stats.upcomingClass.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span>{stats.upcomingClass.enrolled.length} Enrolled (Max {stats.upcomingClass.capacity})</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    No upcoming classes scheduled.
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Bar chart */}
            <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">Client Attendance Rate</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Present', value: stats.attendance.Present },
                      { name: 'Late', value: stats.attendance.Late },
                      { name: 'Absent', value: stats.attendance.Absent }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                    <Bar dataKey="value" fill="#ff6b35" radius={[6, 6, 0, 0]}>
                      <Cell fill="#39ff14" />
                      <Cell fill="#ff6b35" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DASHBOARD VIEW */}
      {role === 'member' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Member grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Check-in Streak</span>
                <p className="text-3xl font-extrabold text-white flex items-center gap-1.5">
                  {stats.attendanceMetrics.present} <Flame className="w-6 h-6 text-[#ff6b35] fill-[#ff6b35]" />
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Late Arrivals</span>
                <p className="text-3xl font-extrabold text-[#ff6b35]">{stats.attendanceMetrics.late}</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Membership Status</span>
                <p className="text-lg font-bold text-[#39ff14] glow-green uppercase flex items-center gap-1.5">
                  {stats.subscription ? `${stats.subscription.plan?.name} (Active)` : 'Unsubscribed'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Plans Snippet */}
            <div className="glass-card p-6 rounded-2xl space-y-6 lg:col-span-2">
              <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">My Active Fitness Sheets</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workout */}
                <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-[#ff6b35]" />
                    <span className="font-bold text-sm">Workout Workout Program</span>
                  </div>
                  {stats.plans.workout ? (
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{stats.plans.workout.title}</p>
                      <span className="text-[10px] text-zinc-500">Issued by {stats.plans.workout.trainer?.name}</span>
                      <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2">{stats.plans.workout.notes}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500 py-2">No active workout plans assigned.</p>
                  )}
                </div>

                {/* Diet */}
                <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Award className="w-5 h-5 text-[#39ff14]" />
                    <span className="font-bold text-sm">Nutritional Diet Program</span>
                  </div>
                  {stats.plans.diet ? (
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{stats.plans.diet.title}</p>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-2">
                        <span>Cals: {stats.plans.diet.caloriesTarget}</span>
                        <span>Prot: {stats.plans.diet.proteinTarget}g</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500 py-2">No active diet plans assigned.</p>
                  )}
                </div>
              </div>
            </div>

            {/* entry QR code */}
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[300px]">
              <div>
                <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider mb-2">My Gym Entry QR</h3>
                <p className="text-[10px] text-zinc-500 leading-normal max-w-[200px]">
                  Scan this QR code at the gym scanner counter to automatically log your attendance.
                </p>
              </div>

              <div className="my-4 p-4 bg-white rounded-2xl inline-block shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-zinc-800">
                {stats.profile?.qrCodeUrl ? (
                  <img
                    src={`${BASE_URL}/${stats.profile.qrCodeUrl}`}
                    alt="My Entry QR"
                    className="w-36 h-36"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-zinc-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                ID: {user?.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
