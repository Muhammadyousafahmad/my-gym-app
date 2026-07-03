'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import API, { BASE_URL } from '../../../lib/api';
import { 
  Apple, 
  User, 
  Clock, 
  Plus, 
  Trash2, 
  FileDown, 
  PlusCircle, 
  CheckCircle2, 
  ShieldAlert,
  Flame,
  Activity,
  Award,
  Utensils
} from 'lucide-react';

export default function DietPlansPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields for creating a diet plan
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [caloriesTarget, setCaloriesTarget] = useState('2000');
  const [proteinTarget, setProteinTarget] = useState('150');
  const [carbsTarget, setCarbsTarget] = useState('200');
  const [fatTarget, setFatTarget] = useState('65');
  const [meals, setMeals] = useState<any[]>([
    { time: 'Breakfast', foodItems: '', calories: 0, protein: 0, carbs: 0, fat: 0 }
  ]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/diet-plans');
      setPlans(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load diet plans.');
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

  const handleAddMealRow = () => {
    setMeals([...meals, { time: 'Meal ' + (meals.length + 1), foodItems: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const handleRemoveMealRow = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleMealChange = (index: number, field: string, value: any) => {
    const updated = [...meals];
    updated[index][field] = value;
    setMeals(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      await API.delete(`/diet-plans/${id}`);
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

    // Filter out empty meal rows
    const validMeals = meals.filter(m => m.foodItems.trim() !== '');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('member', selectedMember);
    formData.append('caloriesTarget', caloriesTarget);
    formData.append('proteinTarget', proteinTarget);
    formData.append('carbsTarget', carbsTarget);
    formData.append('fatTarget', fatTarget);
    formData.append('meals', JSON.stringify(validMeals));
    formData.append('notes', notes);
    
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }

    try {
      setLoading(true);
      await API.post('/diet-plans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormSuccess('Diet plan successfully issued and notified!');
      
      // Clear fields
      setTitle('');
      setSelectedMember('');
      setCaloriesTarget('2000');
      setProteinTarget('150');
      setCarbsTarget('200');
      setFatTarget('65');
      setMeals([{ time: 'Breakfast', foodItems: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
      setPdfFile(null);
      setNotes('');
      setShowCreateForm(false);
      fetchPlans();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save diet plan.');
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
          <h2 className="text-2xl font-extrabold text-white">Diet & Nutrition Plans</h2>
          <p className="text-zinc-500 text-xs mt-1">
            {isTrainer 
              ? 'Compile, edit, and assign custom diet plans to active gym members' 
              : 'Follow your personalized diet sheet prescribed by coach'}
          </p>
        </div>

        {isTrainer && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary rounded-xl px-5 h-11 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Issue Diet Plan
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[#39ff14] text-xs">
          {formSuccess}
        </div>
      )}

      {/* CREATE DIET FORM CONTAINER */}
      {showCreateForm && (
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800/40 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-extrabold text-sm text-zinc-300 uppercase tracking-wider">Issue New Diet & Nutrition Plan</h3>
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
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Plan Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lean Bulk Muscle Plan"
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

            {/* Macro targets */}
            <div className="space-y-4 border-t border-zinc-900 pt-5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-2">Daily Nutritional Macro Targets</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={caloriesTarget}
                    onChange={(e) => setCaloriesTarget(e.target.value)}
                    className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={proteinTarget}
                    onChange={(e) => setProteinTarget(e.target.value)}
                    className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbsTarget}
                    onChange={(e) => setCarbsTarget(e.target.value)}
                    className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={fatTarget}
                    onChange={(e) => setFatTarget(e.target.value)}
                    className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Dynamically build Meal rows */}
            <div className="space-y-4 border-t border-zinc-900 pt-5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-2">Diet Meals Breakdown</label>

              <div className="space-y-3">
                {meals.map((meal, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 items-end">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Meal / Time Label</label>
                      <input
                        type="text"
                        value={meal.time}
                        onChange={(e) => handleMealChange(index, 'time', e.target.value)}
                        placeholder="e.g. Breakfast"
                        className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-600 block mb-1">Food Items</label>
                      <input
                        type="text"
                        value={meal.foodItems}
                        onChange={(e) => handleMealChange(index, 'foodItems', e.target.value)}
                        placeholder="e.g. 4 egg whites, 100g oats"
                        className="w-full h-9 px-3 text-xs glass-input rounded-lg text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 md:col-span-2">
                      <div>
                        <label className="text-[8px] uppercase font-bold text-zinc-600 block mb-1 text-center">Cals</label>
                        <input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => handleMealChange(index, 'calories', parseInt(e.target.value))}
                          className="w-full h-9 px-1 text-xs text-center glass-input rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-bold text-zinc-600 block mb-1 text-center">Prot (g)</label>
                        <input
                          type="number"
                          value={meal.protein}
                          onChange={(e) => handleMealChange(index, 'protein', parseInt(e.target.value))}
                          className="w-full h-9 px-1 text-xs text-center glass-input rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-bold text-zinc-600 block mb-1 text-center">Fat (g)</label>
                        <input
                          type="number"
                          value={meal.fat}
                          onChange={(e) => handleMealChange(index, 'fat', parseInt(e.target.value))}
                          className="w-full h-9 px-1 text-xs text-center glass-input rounded-lg text-white"
                        />
                      </div>
                    </div>

                    {/* Remove button */}
                    <div className="text-right">
                      {meals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMealRow(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg inline-block cursor-pointer mb-0.5"
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
                onClick={handleAddMealRow}
                className="text-xs text-[#ff6b35] hover:text-[#dd4b1a] font-bold flex items-center gap-1 cursor-pointer mt-2"
              >
                <PlusCircle className="w-4 h-4" /> Add Meal Row
              </button>
            </div>

            {/* Optional PDF File and general Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-5">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Plan General Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="hydration rules, cheat day limits, vitamin inputs..."
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

      {/* RENDER ACTIVE DIET SHEETS */}
      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-[#0D0D11] border border-zinc-800/40 rounded-2xl text-zinc-500 text-sm">
          No diet & nutrition plans assigned. Contact your coach!
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

              {/* Macro target display blocks */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex items-center gap-3">
                  <Flame className="w-5 h-5 text-[#ff6b35] shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500">Target Calories</span>
                    <p className="font-extrabold text-white text-sm">{plan.caloriesTarget} kcal</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#39ff14] shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500">Target Protein</span>
                    <p className="font-extrabold text-white text-sm">{plan.proteinTarget} g</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-[#3b82f6] shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500">Target Carbs</span>
                    <p className="font-extrabold text-white text-sm">{plan.carbsTarget} g</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-yellow-500 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500">Target Fats</span>
                    <p className="font-extrabold text-white text-sm">{plan.fatTarget} g</p>
                  </div>
                </div>
              </div>

              {/* Meals list breakdown */}
              {plan.meals?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Scheduled Meals Sheet</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.meals.map((meal: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-2 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-850 text-[#ff6b35] font-bold uppercase tracking-wider">{meal.time}</span>
                          <p className="font-bold text-white text-sm mt-2">{meal.foodItems}</p>
                        </div>
                        <div className="text-right text-[10px] font-semibold text-zinc-400 space-y-1">
                          <p className="text-[#39ff14] font-bold">{meal.calories} kcal</p>
                          <p>P: {meal.protein}g | F: {meal.fat}g</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
