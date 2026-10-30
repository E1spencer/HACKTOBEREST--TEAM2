import React, { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  ArrowDownToLine,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { User, Booking } from '../types/marketplace.ts';

interface HelperPortalProps {
  currentUser: User | null;
  onOpenChat: (bookingId: string) => void;
}

export const HelperPortal: React.FC<HelperPortalProps> = ({ currentUser, onOpenChat }) => {
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [activeJobs, setActiveJobs] = useState<Booking[]>([]);
  const [payoutAmount, setPayoutAmount] = useState<string>('20');
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New service form state
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [newServiceCategory, setNewServiceCategory] = useState('stem-tutoring');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('20');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  useEffect(() => {
    loadHelperData();
  }, [currentUser?.id]);

  const loadHelperData = async () => {
    setLoading(true);
    try {
      const meRes = await api.getMe();
      setProfile(meRes.agentProfile);

      const earnRes = await api.getAgentEarnings();
      setEarnings(earnRes.earnings);

      const bookingsRes = await api.getBookings('agent');
      const all = bookingsRes.bookings;
      setPendingRequests(all.filter((b) => b.status === 'requested'));
      setActiveJobs(all.filter((b) => ['accepted', 'confirmed', 'in_progress'].includes(b.status)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutSubmit = async () => {
    const amountMinor = Math.round(parseFloat(payoutAmount) * 100);
    if (isNaN(amountMinor) || amountMinor < 1000) {
      alert('Minimum payout withdrawal is $10.00');
      return;
    }

    try {
      await api.requestPayout(amountMinor);
      setPayoutMessage(`Successfully initiated direct deposit of $${payoutAmount} to your linked student bank account!`);
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutMessage(null);
        loadHelperData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Payout request failed');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) return;

    try {
      await fetch('/api/v1/agents/me/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-agent-david',
        },
        body: JSON.stringify({
          categorySlug: newServiceCategory,
          title: newServiceTitle,
          description: newServiceDesc,
          pricingType: 'hourly',
          priceMinor: Math.round(parseFloat(newServicePrice) * 100),
          whatsIncluded: ['Personalized peer session', 'Prompt communication', 'Campus check-in'],
        }),
      });

      setShowNewServiceModal(false);
      setNewServiceTitle('');
      setNewServiceDesc('');
      loadHelperData();
    } catch (err: any) {
      alert(err.message || 'Failed to create service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Helper Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{currentUser?.displayName}</h1>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Oakwood Helper
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {profile?.yearOfStudy} · {profile?.major} · Base Quad: {profile?.baseCampusZone || 'Science Quad'}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {profile?.cachedRating?.toFixed(1) || '4.9'}
                </span>
                <span>·</span>
                <span>{profile?.cachedReviewCount || 0} reviews</span>
                <span>·</span>
                <span>{profile?.cachedCompletionRate || 99}% completion rate</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewServiceModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Offer New Campus Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financials & Wallet Balance Cards (Prompt 09) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Wallet Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Available Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              ${((earnings?.availableBalanceMinor || 0) / 100).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Ready for campus direct deposit (ACH)
            </span>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={(earnings?.availableBalanceMinor || 0) < 1000}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Withdraw Direct Deposit</span>
          </button>
        </div>

        {/* Pending In Escrow */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending in Escrow</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              ${((earnings?.pendingBalanceMinor || 0) / 100).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Secured in client escrow; auto-releases on completion
            </span>
          </div>
          <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>CampusHelp Escrow Guarantee Active</span>
          </div>
        </div>

        {/* Total Career Earnings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Campus Earnings</span>
            <TrendingUp className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              ${((earnings?.totalEarnedMinor || 0) / 100).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {profile?.completedJobsCount || 0} completed campus bookings
            </span>
          </div>
          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5 font-medium">
            <span>Platform take rate: 10% · Zero student hidden fees</span>
          </div>
        </div>
      </div>

      {/* Pending Booking Requests Inbox */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Incoming Student Requests ({pendingRequests.length})</h2>
            <p className="text-xs text-slate-500">Respond within 12 hours to maintain your Fast Responder badge.</p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No pending booking requests right now.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={b.clientAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{b.clientName} requested "{b.serviceTitle}"</h3>
                    <p className="text-[11px] text-slate-600">
                      Scheduled: {new Date(b.scheduledStart).toLocaleDateString()} at{' '}
                      {new Date(b.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {b.durationHours}h
                    </p>
                    <p className="text-[11px] text-slate-500">Location: {b.campusLocation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await api.declineBooking(b.id, 'Helper schedule conflict');
                      loadHelperData();
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={async () => {
                      await api.acceptBooking(b.id);
                      loadHelperData();
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Accept (${(b.priceSnapshot.subtotalMinor / 100).toFixed(2)})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs in Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Active & Confirmed Sessions ({activeJobs.length})</h2>

        {activeJobs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No active sessions in progress.</p>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{b.serviceTitle}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {b.status === 'confirmed' ? 'Escrow Held' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Client: {b.clientName} · {b.campusLocation}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenChat(b.id)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Chat with Student
                  </button>
                  {b.status === 'confirmed' && (
                    <button
                      onClick={async () => {
                        await api.startBooking(b.id);
                        loadHelperData();
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      Start Session
                    </button>
                  )}
                  {b.status === 'in_progress' && (
                    <button
                      onClick={async () => {
                        await api.completeBooking(b.id);
                        loadHelperData();
                      }}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Request Campus Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            {payoutMessage ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{payoutMessage}</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Withdraw your available balance directly to your registered Oakwood student checking account (ACH).
                </p>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Withdrawal Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={((earnings?.availableBalanceMinor || 0) / 100).toFixed(2)}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Available: ${((earnings?.availableBalanceMinor || 0) / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayoutSubmit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Confirm Payout Transfer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Service Modal */}
      {showNewServiceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Campus Service</h3>
              <button onClick={() => setShowNewServiceModal(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                >
                  <option value="stem-tutoring">STEM & Coding Tutoring</option>
                  <option value="humanities-writing">Essay Proofreading & Writing</option>
                  <option value="dorm-moving-help">Dorm Moving & Lifting</option>
                  <option value="laundry-wash-fold">Dorm Laundry & Fold</option>
                  <option value="campus-errands">Campus Errands & Deliveries</option>
                  <option value="tech-setup-repairs">Tech & Laptop Setup</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Midterm Crash Review"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hourly Rate ($ USD)</label>
                <input
                  type="number"
                  min="10"
                  max="80"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What will you help students with?"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Publish Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
