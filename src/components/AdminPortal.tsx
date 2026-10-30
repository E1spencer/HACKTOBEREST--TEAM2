import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  DollarSign,
  Users,
  CalendarCheck,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api.ts';

export const AdminPortal: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'verifications' | 'disputes' | 'audit'>('verifications');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOverview();
      setOverview(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAgent = async (userId: string) => {
    try {
      await api.approveVerification(userId);
      setActionSuccess('Helper successfully verified with Oakwood University ID badge.');
      setTimeout(() => setActionSuccess(null), 3000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    try {
      await api.resolveDispute(disputeId, resolution);
      setActionSuccess(`Dispute resolved as ${resolution}. Double-entry ledger balanced.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Dispute resolution failed');
    }
  };

  const kpis = overview?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Dean of Students · Trust & Safety Administration
          </h1>
          <p className="text-xs text-slate-400">
            Student verification gatekeeper, dispute resolution arbitration, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-2xl text-xs flex items-center gap-2 font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </motion.div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Campus GMV
          </span>
          <span className="text-2xl font-black text-white font-heading mt-1 block">
            ${((kpis.totalGmvMinor || 0) / 100).toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">10% Platform Commission</span>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Bookings
          </span>
          <span className="text-2xl font-black text-white font-heading mt-1 block">
            {kpis.completedBookings || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{kpis.activeEscrowBookings || 0} in active escrow</span>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Helpers
          </span>
          <span className="text-2xl font-black text-white font-heading mt-1 block">
            {kpis.verifiedHelpers || 0}
          </span>
          <span className="text-[11px] text-amber-400 font-medium">
            {kpis.pendingVerifications || 0} pending review
          </span>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-4 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Open Safety Disputes
          </span>
          <span className="text-2xl font-black text-rose-400 font-heading mt-1 block">
            {kpis.openDisputes || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Escrow funds frozen</span>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Student ID Queue ({overview?.pendingAgents?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Disputes Arbitration ({overview?.disputes?.filter((d: any) => d.status === 'opened').length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>System Audit Log</span>
        </button>
      </div>

      {/* TAB 1: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white font-heading">Student Helper ID Review Queue</h2>
            <span className="text-xs text-slate-400">Requires verified @oakwood.edu matriculation</span>
          </div>

          {overview?.pendingAgents?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-200">Verification queue is clean!</p>
              <p className="mt-0.5">All student helpers on campus have been vetted and verified.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview?.pendingAgents?.map((item: any) => (
                <div
                  key={item.profile.userId}
                  className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img src={item.user?.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
                    <div>
                      <h3 className="text-xs font-bold text-white font-heading">{item.user?.displayName}</h3>
                      <p className="text-[11px] text-slate-300">
                        {item.user?.studentId} · {item.profile.yearOfStudy} · {item.profile.major}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Dorm: {item.user?.campusDorm} · Base: {item.profile.baseCampusZone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveAgent(item.profile.userId)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Grant Badge</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Disputes Arbitration */}
      {activeTab === 'disputes' && (
        <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-white font-heading">Active Campus Trust Disputes</h2>

          {overview?.disputes?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-200">Zero active safety disputes.</p>
              <p className="mt-0.5">Student transactions and sessions are proceeding smoothly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overview?.disputes?.map((disp: any) => (
                <div
                  key={disp.id}
                  className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white font-heading">
                        Dispute on Booking #{disp.bookingId}
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Opened by {disp.openedByName} · Reason: <span className="font-semibold text-rose-300">{disp.reason}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-500/30 uppercase">
                      {disp.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 text-xs text-slate-300 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">EVIDENCE PROVIDED</span>
                    <p>{disp.evidenceText}</p>
                  </div>

                  {disp.status === 'opened' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'client_refund_full')}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Refund Student Client Full
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'release_to_agent')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Release Funds to Helper
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: System Audit Log */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white font-heading">Enterprise Immutable Audit Trail (ADR-007)</h2>
            <span className="text-xs text-slate-400">Tracks all financial, state, and security mutations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {overview?.auditLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-semibold text-white">{log.actor}</td>
                    <td className="p-3 text-indigo-400 font-medium">{log.action}</td>
                    <td className="p-3 text-slate-300">{log.entityType}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{log.entityId}</td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
