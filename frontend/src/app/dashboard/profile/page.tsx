'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import API, { BASE_URL } from '../../../lib/api';
import { 
  User, 
  Phone, 
  Calendar, 
  Activity, 
  Scale, 
  ShieldCheck, 
  Camera,
  Heart,
  Plus,
  HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Member fields
  const [dob, setDob] = useState(profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitnessGoal || 'Maintain Fitness');
  const [height, setHeight] = useState(profile?.height || '');
  const [weight, setWeight] = useState('');
  
  // Emergency Contact
  const [ecName, setEcName] = useState(profile?.emergencyContact?.name || '');
  const [ecRelationship, setEcRelationship] = useState(profile?.emergencyContact?.relationship || '');
  const [ecPhone, setEcPhone] = useState(profile?.emergencyContact?.phone || '');

  // Trainer fields
  const [bio, setBio] = useState(profile?.bio || '');
  const [newCert, setNewCert] = useState('');
  const [certs, setCerts] = useState<string[]>(profile?.certifications || []);
  const [specs, setSpecs] = useState<string[]>(profile?.specializations || []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    if (photo) {
      formData.append('photo', photo);
    }

    if (user?.role === 'member') {
      formData.append('dob', dob);
      formData.append('gender', gender);
      formData.append('fitnessGoal', fitnessGoal);
      if (height) formData.append('height', height.toString());
      if (weight) formData.append('weight', weight.toString());
      
      formData.append('emergencyContact', JSON.stringify({
        name: ecName,
        relationship: ecRelationship,
        phone: ecPhone
      }));
    } else if (user?.role === 'trainer') {
      formData.append('bio', bio);
      formData.append('certifications', JSON.stringify(certs));
      formData.append('specializations', JSON.stringify(specs));
    }

    const ok = await updateProfile(formData);
    if (ok) {
      setSuccess(true);
      setWeight(''); // Clear single weight log input
    } else {
      setError('Failed to save profile changes.');
    }
    setLoading(false);
  };

  // Weight history plotting helper
  const weightData = profile?.weightHistory?.map((w: any) => ({
    date: new Date(w.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    weight: w.weight
  })) || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Profile Configurations</h2>
        <p className="text-zinc-500 text-xs mt-1">Manage personal metrics, schedule hours, and contact logs</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[#39ff14] text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Photo Upload & Goal */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl text-center space-y-4 flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-full border border-zinc-800 overflow-hidden bg-zinc-900 group">
              <img
                src={photoPreview || (user?.photo && user.photo.startsWith('uploads') ? `${BASE_URL}/${user.photo}` : user?.photo || '/default-avatar.png')}
                alt="Profile photo"
                className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
              />
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Camera className="w-6 h-6" />
                <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/*" />
              </label>
            </div>
            
            <div>
              <h3 className="font-extrabold text-white text-base leading-none mb-1.5">{user?.name}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] uppercase font-bold tracking-wider">
                {user?.role}
              </span>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal">
              Click photo to select a new profile picture. Max upload size 10MB.
            </p>
          </div>

          {/* Member Weight Graph widget */}
          {user?.role === 'member' && weightData.length > 1 && (
            <div className="glass-card p-6 rounded-3xl space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Weight Progress Log</span>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c24" />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={9} />
                    <YAxis stroke="#52525b" fontSize={9} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: 10 }} />
                    <Area type="monotone" dataKey="weight" stroke="#ff6b35" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Form details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-zinc-800/40 space-y-6">
            <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-3">
              Account Attributes
            </h3>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-xs glass-input rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-xs glass-input rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            {/* MEMBER FIELDS */}
            {user?.role === 'member' && (
              <div className="space-y-6 border-t border-zinc-900 pt-6">
                <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Health Metrics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white bg-[#0D0D11]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Fitness Goal</label>
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white bg-[#0D0D11]"
                    >
                      <option value="Lose Weight">Lose Weight</option>
                      <option value="Build Muscle">Build Muscle</option>
                      <option value="Improve Endurance">Improve Endurance</option>
                      <option value="Maintain Fitness">Maintain Fitness</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g. 175"
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Log Weight (kg)</label>
                    <div className="relative">
                      <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Log current weight..."
                        className="w-full h-10 pl-10 pr-4 text-xs glass-input rounded-xl text-white border-dashed border-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={ecName}
                      onChange={(e) => setEcName(e.target.value)}
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={ecRelationship}
                      onChange={(e) => setEcRelationship(e.target.value)}
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={ecPhone}
                      onChange={(e) => setEcPhone(e.target.value)}
                      className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TRAINER FIELDS */}
            {user?.role === 'trainer' && (
              <div className="space-y-6 border-t border-zinc-900 pt-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Biography</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Coach credentials, bio, philosophy..."
                    className="w-full p-4 text-xs glass-input rounded-xl text-white h-24 resize-none"
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
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
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      placeholder="e.g. NASM Master Trainer"
                      className="flex-1 h-10 px-4 text-xs glass-input rounded-xl text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCert}
                      className="px-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 text-xs text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {certs.map((cert, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-950/40 border border-zinc-900 px-4 py-2 rounded-xl text-xs">
                        <span className="text-zinc-300">{cert}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(index)}
                          className="text-red-500 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save trigger */}
            <div className="flex justify-end pt-4 border-t border-zinc-900">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary rounded-xl px-6 h-11 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
