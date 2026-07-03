'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/store';
import API from '../../../lib/api';
import { 
  CreditCard, 
  Check, 
  ArrowRight, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  CheckCircle,
  Clock
} from 'lucide-react';

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, checkAuth } = useAuthStore();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch plans
      const plansRes = await API.get('/payments/plans');
      setPlans(plansRes.data.data);

      // Fetch history
      const historyRes = await API.get('/payments/history');
      setHistory(historyRes.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch billing profiles.');
    } finally {
      setLoading(false);
    }
  };

  // Run Stripe callback or Mock confirmation on mount
  useEffect(() => {
    const handleSessionConfirmation = async () => {
      const sessionId = searchParams.get('session_id');
      const isMock = searchParams.get('mock') === 'true';
      const planId = searchParams.get('planId');
      const canceled = searchParams.get('canceled') === 'true';

      if (canceled) {
        setError('Checkout was canceled. No payments were registered.');
        router.replace('/dashboard/payments');
        return;
      }

      if (sessionId) {
        try {
          setLoading(true);
          
          if (isMock && planId) {
            // Confirm the mock checkout session in backend
            await API.post('/payments/confirm-mock', { planId });
            setMessage('Congratulations! Your mock membership tier is now fully active.');
          } else {
            // Standard Stripe verification (the Stripe webhook should have updated it, we just refresh profile)
            setMessage('Your payment has been completed successfully. Synchronizing membership records...');
          }

          // Clear parameters
          router.replace('/dashboard/payments');
          
          // Re-fetch auth stats to update profile state
          await checkAuth();
          await fetchPaymentData();
        } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.error || 'Failed to verify transaction.');
        } finally {
          setLoading(false);
        }
      } else {
        fetchPaymentData();
      }
    };

    handleSessionConfirmation();
  }, [searchParams]);

  const handleSubscribe = async (planId: string) => {
    try {
      setPurchaseLoading(planId);
      setError(null);
      setMessage(null);

      const res = await API.post('/payments/checkout', { planId });
      
      if (res.data.url) {
        // Redirect to Stripe checkout (or mock url)
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Checkout initialization failed.');
      setPurchaseLoading(null);
    }
  };

  const isActive = profile?.subscriptionStatus === 'active';
  const currentPlanId = profile?.membershipPlan?._id || profile?.membershipPlan;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Membership Billing & Subscriptions</h2>
        <p className="text-zinc-500 text-xs mt-1">Select a membership plan to unlock group classes, gym access, and trainers</p>
      </div>

      {/* Message alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[#39ff14] text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active subscription card if member */}
          {user?.role === 'member' && isActive && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900/60 via-[#181820]/40 to-zinc-900/60 border border-zinc-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-wider block">Active Membership Plan</span>
                <h3 className="font-extrabold text-white text-lg">
                  {plans.find(p => p._id === currentPlanId)?.name || 'Premium Club Access'}
                </h3>
                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Renews/Expires on: {profile.subscriptionEnd ? new Date(profile.subscriptionEnd).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] text-xs font-bold uppercase tracking-wider glow-green">
                Account Active
              </div>
            </div>
          )}

          {/* Membership Plan selection grid (for Members, or general display for Admin) */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider">Available Packages</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = plan._id === currentPlanId && isActive;
                const featuresList = plan.features || [];

                return (
                  <div 
                    key={plan._id} 
                    className={`glass-card p-6 rounded-3xl flex flex-col justify-between border relative ${
                      isCurrent ? 'border-[#ff6b35] shadow-[0_0_30px_rgba(255,107,53,0.15)]' : 'border-zinc-800/40'
                    }`}
                  >
                    <div>
                      {/* Name & price */}
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider"> Olympus Tier</span>
                      <h4 className="text-lg font-black text-white mt-1 mb-2">{plan.name}</h4>
                      <p className="text-3xl font-extrabold text-[#ff6b35] glow-orange">
                        ${plan.price}
                        <span className="text-xs text-zinc-500 font-normal"> / mo</span>
                      </p>

                      {/* Features */}
                      <ul className="mt-6 space-y-3">
                        {featuresList.map((f: string, i: number) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-2.5 leading-normal">
                            <Check className="w-4 h-4 text-[#39ff14] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA button (Members only) */}
                    {user?.role === 'member' && (
                      <button
                        onClick={() => handleSubscribe(plan._id)}
                        disabled={isCurrent || purchaseLoading !== null}
                        className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mt-8 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'btn-primary text-white'
                        }`}
                      >
                        {purchaseLoading === plan._id ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : isCurrent ? (
                          'Current Subscription'
                        ) : (
                          <>
                            Choose Plan
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice / Payment transaction logs */}
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              Transaction Log History
            </h3>

            <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Billing Date</th>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Membership Tier</th>
                      <th className="p-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-xs text-zinc-500">
                          No transactions completed yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((log) => (
                        <tr key={log._id} className="border-b border-zinc-900 last:border-0 text-xs text-zinc-400">
                          <td className="p-4 font-medium text-zinc-300">
                            {new Date(log.createdAt).toLocaleDateString()} at{' '}
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 font-mono text-zinc-500">{log.stripePaymentIntentId}</td>
                          <td className="p-4 text-zinc-300">{log.plan?.name || 'General Access'}</td>
                          <td className="p-4 text-right font-bold text-[#39ff14]">${log.amount}</td>
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
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <span className="w-8 h-8 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin inline-block"></span>
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  );
}
