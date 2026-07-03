'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../lib/store';
import API from '../../../../lib/api';
import { Megaphone, Mail, MessageSquare, Bell, User, CheckCircle, ShieldAlert } from 'lucide-react';

export default function BroadcastPage() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('In-App');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMembersList = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/members' : '/members/trainer/assigned';
      const res = await API.get(endpoint);
      setMembers(res.data.data);
    } catch (err) {
      console.error('Error fetching members list:', err);
    }
  };

  useEffect(() => {
    fetchMembersList();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!title || !message) {
      setError('Please fill in both title and message body.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title,
        message,
        channel,
        recipientId: recipientId || null // If empty, broadcasts to all
      };

      const res = await API.post('/notifications/broadcast', payload);
      setSuccess(res.data.message || 'Notification broadcasted successfully!');
      
      // Clear fields
      setTitle('');
      setMessage('');
      setRecipientId('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Broadcast failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Broadcast Public Alerts</h2>
        <p className="text-zinc-500 text-xs mt-1">Send immediate notifications to members via In-App, Email, or SMS channels</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[#39ff14] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-[#39ff14]" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl border border-zinc-800/40">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Audience */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
              Target Audience
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-xs glass-input rounded-xl text-white bg-[#0D0D11]"
              >
                <option value="">Public Announcement (Broadcast to All Active Members)</option>
                {members.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    Direct: {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-2.5 ml-1">
              Delivery Channels
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'In-App', icon: Bell, label: 'Dashboard App' },
                { name: 'Email', icon: Mail, label: 'Email Only' },
                { name: 'SMS', icon: MessageSquare, label: 'SMS Phone' },
                { name: 'All', icon: Megaphone, label: 'All Channels' }
              ].map((chan) => {
                const Icon = chan.icon;
                const isSelected = channel === chan.name;

                return (
                  <button
                    key={chan.name}
                    type="button"
                    onClick={() => setChannel(chan.name)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-[#ff6b35] shadow-[0_0_15px_rgba(255,107,53,0.1)]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700/60'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">{chan.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Broadcast Content */}
          <div className="space-y-4 pt-3 border-t border-zinc-900">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule Update or Facility closures"
                className="w-full h-11 px-4 text-xs glass-input rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">
                Message Body
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your broadcast message details..."
                className="w-full p-4 text-xs glass-input rounded-xl text-white h-32 resize-none"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-xl px-6 h-11 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Megaphone className="w-4.5 h-4.5" />
                  Broadcast Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
