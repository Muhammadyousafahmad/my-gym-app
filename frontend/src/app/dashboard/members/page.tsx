'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import API, { BASE_URL } from '../../../lib/api';
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  ShieldAlert, 
  Phone, 
  Mail, 
  Activity, 
  Clock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function MembersPage() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = user?.role === 'admin' ? '/members' : '/members/trainer/assigned';
      const res = await API.get(endpoint);
      setMembers(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load member records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const toggleStatus = async (memberId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await API.put(`/members/${memberId}/status`, { status: newStatus });
      
      // Update local state immediately
      setMembers(prev => 
        prev.map(m => m._id === memberId ? { ...m, status: newStatus } : m)
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update member status');
    }
  };

  // Filter members list by search input matching name or email
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            {isAdmin ? 'Members Directory' : 'Assigned Member Clients'}
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            {isAdmin ? 'Manage gym member attributes, billing health, and check-in active states.' : 'View details and workouts for members currently training with you.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-4 text-xs glass-input rounded-xl text-white font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-[#0D0D11] border border-zinc-800/40 rounded-2xl text-zinc-500 text-sm">
          No matching member profiles found.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-zinc-800/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Member Info</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Membership Level</th>
                  <th className="p-4">Expirations</th>
                  <th className="p-4 text-center">Status</th>
                  {isAdmin && <th className="p-4 text-right">Access Controls</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const profileInfo = m.profile || {};
                  const planName = profileInfo.membershipPlan?.name || 'Unsubscribed';
                  const isSuspended = m.status === 'suspended';
                  const isSubActive = profileInfo.subscriptionStatus === 'active';

                  return (
                    <tr key={m._id || m.id} className="border-b border-zinc-900 last:border-0 text-xs text-zinc-400 hover:bg-zinc-900/10 transition-colors">
                      {/* Member Info details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full border border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
                            <img
                              src={m.photo?.startsWith('uploads') ? `${BASE_URL}/${m.photo}` : m.photo || '/default-avatar.png'}
                              alt={m.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-200 text-sm block leading-tight">{m.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono select-all">UID: {m._id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Mail className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{m.email}</span>
                        </div>
                        {m.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                            <Phone className="w-3.5 h-3.5 text-zinc-700" />
                            <span>{m.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Membership */}
                      <td className="p-4">
                        <span className={`font-bold ${isSubActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                          {planName}
                        </span>
                      </td>

                      {/* End Date */}
                      <td className="p-4 text-zinc-400">
                        {profileInfo.subscriptionEnd 
                          ? new Date(profileInfo.subscriptionEnd).toLocaleDateString() 
                          : 'N/A'}
                      </td>

                      {/* Status badge */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isSuspended
                            ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                            : isSubActive
                              ? 'bg-green-500/10 border border-green-500/20 text-[#39ff14]'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                        }`}>
                          {isSuspended ? 'Suspended' : isSubActive ? 'Active' : 'Expired'}
                        </span>
                      </td>

                      {/* Admin controls */}
                      {isAdmin && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleStatus(m._id, m.status)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                              isSuspended
                                ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-[#39ff14]'
                                : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400'
                            }`}
                          >
                            {isSuspended ? (
                              <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Re-Activate</span>
                            ) : (
                              <span className="flex items-center gap-1.5"><UserX className="w-3.5 h-3.5" /> Suspend</span>
                            )}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
