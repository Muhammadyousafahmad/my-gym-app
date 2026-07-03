'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import API, { BASE_URL } from '../../../lib/api';
import { 
  ClipboardList, 
  User, 
  Clock, 
  Activity, 
  Plus, 
  Trash2, 
  FileDown, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

export default function WorkoutPlansPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields for creating a workout plan
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [exercises, setExercises] = useState<any[]>([
    { name: '', sets: 3, reps: '12', weight: '', restSeconds: 60, notes: '' }
  ]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/workout-plans');
      setPlans(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load workout plans.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (user?.role === 'trainer' || user?.role === 'admin') {
      try {
        const endpoint = user.role === 'admin' ? '/members' : '/members/trainer/assigned';
        const res = await API.get(endpoint);
        setMembers(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMembers();
  }, [user]);

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '12', weight: '', restSeconds: 60, notes: '' }]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      await API.delete(`/workout-plans/${id}`);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete plan');
    }
  };

  const handleCreatePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title || !selectedMember) {
      setFormError('Please enter a title and select a member.');
      return;
    }

    // Filter out empty exercise rows
    const validExercises = exercises.filter(ex => ex.name.trim() !== '');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('member', selectedMember);
    formData.append('exercises', JSON.stringify(validExercises));
    formData.append('notes', notes);
    
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }

    try {
      setLoading(true);
      await API.post('/workout-plans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormSuccess('Workout plan successfully issued and notified!');
      
      // Clear fields
      setTitle('');
      setSelectedMember('');
      setExercises([{ name: '', sets: 3, reps: '12', weight: '', restSeconds: 60, notes: '' }]);
      setPdfFile(null);
      setNotes('');
      setShowCreateForm(false);
      fetchPlans();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save workout plan.');
    } finally {
      setLoading(false);
    }
  };

  const isTrainer = user?.role === 'trainer' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Workout Programs</h2>
          <p className="text-zinc-500 text-xs mt-1">
            {isTrainer 
              ? 'Compile, edit, and assign custom workout programs to active gym members' 
              : 'Follow your personalized muscle builder routine prescribed by coach'}
          </p>
        </div>

        {isTrainer && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary rounded-xl px-5 h-11 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Issue Program
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[#39ff14] text-xs">
          {formSuccess}
        </div>
      )}

      {/* CREATE WORKOUT FORM CONTAINER */}
      {showCreateForm && (
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800/40 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-extrabold text-sm text-zinc-300 uppercase tracking-wider">Issue New Workout Program</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreatePlanSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Program Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hypertrophy Conditioning Phase 1"
                  className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Assign to Member</label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full h-10 px-4 text-xs glass-input rounded-xl text-white bg-[#0D0D11]"
                  required
                >
                  <option value="">Choose Member...</option>
                  {members.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamically build Exercise rows */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-2">Exercise Routines</label>

              <div className="space-y-3">
                {exercises.map((ex, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 items-end">
                    <div className="md:col-span-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Exercise Name</label>
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        placeholder="e.g. Barbell Squats"
                        className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Sets</label>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                        className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Reps / Time</label>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                        placeholder="e.g. 10-12"
                        className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Weight Target</label>
                      <input
                        type="text"
                        value={ex.weight}
                        onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                        placeholder="e.g. 60 kg"
                        className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                      />
                    </div>

                    {/* Remove button */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Rest (s)</label>
                        <input
                          type="number"
                          value={ex.restSeconds}
                          onChange={(e) => handleExerciseChange(index, 'restSeconds', parseInt(e.target.value))}
                          className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                          min="0"
                        />
                      </div>
                      
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 cursor-pointer mb-0.5"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs text-[#ff6b35] hover:text-[#dd4b1a] font-bold flex items-center gap-1 cursor-pointer mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Add Exercise
              </button>
            </div>

            {/* Optional PDF File and general Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-5">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Program General Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Focus points, safety instructions, warm-up guides..."
                  className="w-full p-4 text-xs glass-input rounded-xl text-white h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Upload Plan PDF (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="w-full h-11 text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer pt-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary rounded-xl px-6 h-11 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Issue Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER ACTIVE PROGRAMS */}
      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-[#0D0D11] border border-zinc-800/40 rounded-2xl text-zinc-500 text-sm">
          No workout plans assigned. Contact your coach!
        </div>
      ) : (
        <div className="space-y-8">
          {plans.map((plan) => (
            <div key={plan._id} className="glass-panel p-6 rounded-3xl border border-zinc-800/40 space-y-6">
              {/* Header card details */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{plan.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Coach {plan.trainer?.name}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Issued: {new Date(plan.createdAt).toLocaleDateString()}</span>
                    {isTrainer && (
                      <span className="text-[#ff6b35] font-semibold">Assigned to: {plan.member?.name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {plan.pdfUrl && (
                    <a
                      href={`${BASE_URL}/${plan.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-4 h-4" /> Download PDF
                    </a>
                  )}

                  {isTrainer && (
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      className="p-2 text-zinc-500 hover:text-red-500 rounded-xl border border-transparent hover:border-red-500/10 hover:bg-red-500/5 transition-all cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises grid */}
              {plan.exercises?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plan.exercises.map((ex: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-3 relative hover:border-zinc-700/60 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-zinc-500 font-mono">EX-{idx + 1}</span>
                        <Activity className="w-4 h-4 text-[#ff6b35]" />
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-white text-sm leading-snug mb-1">{ex.name}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-zinc-400 mt-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800">{ex.sets} Sets</span>
                          <span className="px-2 py-0.5 rounded bg-zinc-800">{ex.reps} Reps</span>
                          {ex.weight && <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-800 text-[#ff6b35]">{ex.weight}</span>}
                          {ex.restSeconds > 0 && <span className="px-2 py-0.5 rounded bg-zinc-800">Rest {ex.restSeconds}s</span>}
                        </div>
                      </div>

                      {ex.notes && (
                        <p className="text-[10px] text-zinc-500 leading-normal border-t border-zinc-900 pt-2.5 mt-2.5 italic">
                          💡 {ex.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {plan.notes && (
                <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs text-zinc-400 leading-relaxed">
                  <h5 className="font-bold text-zinc-300 mb-1 uppercase tracking-wider text-[10px]">Coach Note Instructions</h5>
                  {plan.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
