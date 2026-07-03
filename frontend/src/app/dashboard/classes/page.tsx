'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import API from '../../../lib/api';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  Users, 
  MapPin, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function ClassesPage() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating a new class
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [room, setRoom] = useState('Main Studio');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/classes');
      setClasses(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch class listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    if (user?.role === 'admin') {
      try {
        const res = await API.get('/trainers');
        setTrainers(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTrainers();
  }, [user]);

  const handleEnroll = async (classId: string) => {
    try {
      await API.post(`/classes/${classId}/enroll`);
      fetchClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to enroll');
    }
  };

  const handleUnenroll = async (classId: string) => {
    try {
      await API.post(`/classes/${classId}/unenroll`);
      fetchClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel enrollment');
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class session?')) return;
    try {
      await API.delete(`/classes/${classId}`);
      fetchClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete class');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !startTime || !endTime) {
      setFormError('Please fill out name, start, and end time fields.');
      return;
    }

    try {
      // If trainer is creating, assign to themselves. Otherwise use selected trainer.
      const trainerId = user?.role === 'trainer' ? user.id : selectedTrainer;

      if (!trainerId) {
        setFormError('Trainer selection is required.');
        return;
      }

      await API.post('/classes', {
        name,
        description,
        trainer: trainerId,
        startTime,
        endTime,
        capacity: parseInt(capacity),
        room
      });

      // Clear fields & close
      setName('');
      setDescription('');
      setSelectedTrainer('');
      setStartTime('');
      setEndTime('');
      setCapacity('20');
      setRoom('Main Studio');
      setShowCreateModal(false);
      fetchClasses();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create class schedule.');
    }
  };

  const canModify = user?.role === 'admin' || user?.role === 'trainer';

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Group Classes</h2>
          <p className="text-zinc-500 text-xs mt-1">Enroll in specialized training classes led by Olympus coaches</p>
        </div>

        {canModify && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary rounded-xl px-5 h-11 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Class
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-[#0D0D11] border border-zinc-800/40 rounded-2xl text-zinc-500 text-sm">
          No classes currently scheduled. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isEnrolled = cls.enrolled.some((e: any) => e._id === user?.id);
            const isWaitlisted = cls.waitlist.some((w: any) => w._id === user?.id);
            const fillRate = (cls.enrolled.length / cls.capacity) * 100;
            const spotsLeft = cls.capacity - cls.enrolled.length;

            return (
              <div 
                key={cls._id} 
                className={`glass-card p-6 rounded-2xl relative flex flex-col justify-between min-h-[280px] ${
                  isEnrolled ? 'border border-[#ff6b35]/30' : ''
                }`}
              >
                <div>
                  {/* Class Title & Badges */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-extrabold text-white text-base leading-snug">{cls.name}</h3>
                    {isEnrolled && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] uppercase font-bold tracking-wider">
                        Enrolled
                      </span>
                    )}
                    {isWaitlisted && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] uppercase font-bold tracking-wider">
                        Waitlist
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed">{cls.description}</p>

                  {/* Metadata fields */}
                  <div className="space-y-2.5 mb-6 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      <span>
                        {new Date(cls.startTime).toLocaleDateString()} at{' '}
                        {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-600" />
                      <span>Led by <strong className="text-zinc-300 font-semibold">{cls.trainer?.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-600" />
                      <span>Studio: {cls.room}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-600" />
                      <span>{cls.enrolled.length} / {cls.capacity} spots filled</span>
                    </div>
                  </div>
                </div>

                {/* Progress & CTAs */}
                <div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                    <div 
                      className={`h-full ${fillRate >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-[#ff6b35] to-[#dd4b1a]'}`} 
                      style={{ width: `${Math.min(fillRate, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    {/* Delete button (Admins, or specific Trainer of class) */}
                    {canModify && (cls.trainer?._id === user?.id || user?.role === 'admin') ? (
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    ) : <div />}

                    {/* Member action button */}
                    {user?.role === 'member' && (
                      isEnrolled || isWaitlisted ? (
                        <button
                          onClick={() => handleUnenroll(cls._id)}
                          className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/40 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(cls._id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            spotsLeft <= 0 
                              ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200' 
                              : 'bg-white text-black hover:bg-zinc-200'
                          }`}
                        >
                          {spotsLeft <= 0 ? 'Join Waitlist' : 'Book Class'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE CLASS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0D0D11] border border-zinc-800 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            <h3 className="text-lg font-extrabold text-white mb-2 uppercase tracking-wide">Schedule Group Class</h3>
            <p className="text-zinc-500 text-xs mb-4 leading-normal">Enter class properties to append the session to the calendar.</p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Class Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vinyasa Power Yoga"
                  className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly detail workout layout..."
                  className="w-full p-4 text-xs glass-input rounded-xl text-white resize-none h-20"
                />
              </div>

              {/* Trainer list picker (Admin only) */}
              {user?.role === 'admin' && (
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Assigned Trainer</label>
                  <select
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white bg-[#0D0D11]"
                    required
                  >
                    <option value="">Choose Trainer...</option>
                    {trainers.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Room Studio</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Zen Room B"
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 h-10 text-xs font-semibold rounded-xl text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 h-10 text-xs font-bold rounded-xl btn-primary cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
