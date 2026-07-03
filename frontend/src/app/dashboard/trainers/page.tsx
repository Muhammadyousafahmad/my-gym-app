'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import API, { BASE_URL } from '../../../lib/api';
import { 
  Dumbbell, 
  Mail, 
  Phone, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  Award, 
  Clock, 
  FileText 
} from 'lucide-react';

export default function TrainersPage() {
  const { user } = useAuthStore();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating a new trainer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [certs, setCerts] = useState<string[]>([]);
  const [newCert, setNewCert] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/trainers');
      setTrainers(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch trainers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [user]);

  const handleAddCert = () => {
    if (newCert.trim() && !certs.includes(newCert.trim())) {
      setCerts([...certs, newCert.trim()]);
      setNewCert('');
    }
  };

  const handleRemoveCert = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  const handleSpecToggle = (specName: string) => {
    if (specs.includes(specName)) {
      setSpecs(specs.filter(s => s !== specName));
    } else {
      setSpecs([...specs, specName]);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    if (!confirm('Are you sure you want to delete this trainer from the system?')) return;
    try {
      await API.delete(`/trainers/${trainerId}`);
      fetchTrainers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete trainer');
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password) {
      setFormError('Please fill in name, email, and password.');
      return;
    }

    try {
      await API.post('/trainers', {
        name,
        email,
        password,
        phone,
        bio,
        certifications: certs,
        specializations: specs
      });

      // Clear fields & close modal
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setBio('');
      setCerts([]);
      setSpecs([]);
      setShowCreateModal(false);
      fetchTrainers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create trainer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Trainer Registry</h2>
          <p className="text-zinc-500 text-xs mt-1">Manage certified coaches and personal trainers on active duty</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary rounded-xl px-5 h-11 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Trainer
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center py-12 bg-[#0D0D11] border border-zinc-800/40 rounded-2xl text-zinc-500 text-sm">
          No coaches currently registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((t) => (
            <div key={t._id || t.id} className="glass-card p-6 rounded-3xl flex flex-col justify-between min-h-[350px]">
              <div>
                {/* Profile Card Header */}
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0">
                    <img
                      src={t.photo?.startsWith('uploads') ? `${BASE_URL}/${t.photo}` : t.photo || '/default-avatar.png'}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-snug">{t.name}</h3>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Coach Registry</span>
                  </div>
                </div>

                {/* Biography */}
                {t.profile?.bio && (
                  <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed mb-4 italic">
                    &ldquo;{t.profile.bio}&rdquo;
                  </p>
                )}

                {/* Info List */}
                <div className="space-y-2 mb-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-650" />
                    <span>{t.email}</span>
                  </div>
                  {t.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-650" />
                      <span>{t.phone}</span>
                    </div>
                  )}
                </div>

                {/* Specializations list */}
                {t.profile?.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {t.profile.specializations.map((spec: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[#ff6b35]/80"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions & Rating */}
              <div className="flex justify-between items-center border-t border-zinc-900 pt-4 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-[#39ff14]" />
                  <span className="text-xs text-zinc-400 font-bold">{t.profile?.rating || '5.0'} / 5.0 Rating</span>
                </div>

                <button
                  onClick={() => handleDeleteTrainer(t._id)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                  title="Remove Trainer"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TRAINER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0D0D11] border border-zinc-800 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-white mb-2 uppercase tracking-wide">Register Certified Coach</h3>
            <p className="text-zinc-500 text-xs mb-4 leading-normal">Setup account credentials and professional attributes for the new trainer.</p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTrainer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Trainer Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Connor"
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Biography / Tagline</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Certified strength coach specializing in..."
                  className="w-full p-4 text-xs glass-input rounded-xl text-white resize-none h-20"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5">Coach Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {['Weight Loss', 'Bodybuilding', 'Cardio & Endurance', 'Yoga & Flexibility', 'Strength & Conditioning', 'Rehabilitation'].map((spec) => {
                    const isSelected = specs.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleSpecToggle(spec)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-[#ff6b35]/20 border border-[#ff6b35]/30 text-[#ff6b35]' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Certificates / Achievements</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="e.g. NASM CPT"
                    className="flex-1 h-9 px-4 text-xs glass-input rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCert}
                    className="px-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 text-xs text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {certs.map((c, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => handleRemoveCert(idx)}
                      className="text-[9px] bg-zinc-950 border border-zinc-900 px-2.5 py-1 rounded-lg text-zinc-300 cursor-pointer hover:border-red-500/20 hover:text-red-500 transition-colors"
                      title="Click to remove"
                    >
                      {c} &times;
                    </span>
                  ))}
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
                  Register Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
