import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  ShieldCheck,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api.ts';
import { Booking, BookingStatus, User } from '../types/marketplace.ts';

interface BookingsViewProps {
  currentUser: User | null;
  onOpenChat: (bookingId: string) => void;
  onOpenReview: (booking: Booking) => void;
  onOpenDispute: (booking: Booking) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  currentUser,
  onOpenChat,
  onOpenReview,
  onOpenDispute,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, [currentUser?.id]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings();
      setBookings(res.bookings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId: string, actionFn: () => Promise<any>, triggerConfetti = false) => {
    setActionLoading(bookingId);
    try {
      await actionFn();
      if (triggerConfetti) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#10b981'],
        });
      }
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'active') {
      return ['requested', 'accepted', 'confirmed', 'in_progress'].includes(b.status);
    }
    if (filterTab === 'completed') {
      return ['completed', 'closed'].includes(b.status);
    }
    if (filterTab === 'cancelled') {
      return ['cancelled', 'declined', 'expired', 'disputed'].includes(b.status);
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'requested':
        return (
          <span className="text-amber-300 bg-amber-950/60 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Waiting for Helper
          </span>
        );
      case 'accepted':
        return (
          <span className="text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Accepted · Ready for Escrow
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Held in Escrow
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Session In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="text-teal-300 bg-teal-950/60 border border-teal-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Completed · Awaiting Release
          </span>
        );
      case 'closed':
        return (
          <span className="text-slate-300 bg-slate-800/60 border border-white/10 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Closed & Escrow Released
          </span>
        );
      case 'disputed':
        return (
          <span className="text-rose-300 bg-rose-950/60 border border-rose-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Trust Arbitration
          </span>
        );
      default:
        return (
          <span className="text-slate-400 bg-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
            {status}
          </span>
        );
    }
  };

  const getTimelineSteps = (status: BookingStatus) => {
    const steps = [
      { key: 'requested', label: 'Requested' },
      { key: 'accepted', label: 'Accepted' },
      { key: 'confirmed', label: 'Escrow Paid' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'completed', label: 'Finished' },
      { key: 'closed', label: 'Released' },
    ];

    const statusOrder: Record<string, number> = {
      requested: 0,
      accepted: 1,
      confirmed: 2,
      in_progress: 3,
      completed: 4,
      closed: 5,
      declined: -1,
      cancelled: -1,
      disputed: 2,
    };

    const currentIdx = statusOrder[status] ?? 0;

    return (
      <div className="flex items-center w-full py-2 overflow-x-auto">
        {steps.map((st, i) => {
          const isDone = i <= currentIdx && currentIdx >= 0;
          const isCurrent = i === currentIdx;
          return (
            <React.Fragment key={st.key}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500 border border-white/10'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                    isCurrent ? 'text-indigo-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 min-w-[20px] transition-colors ${
                    i < currentIdx ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const isClient = (b: Booking) => b.clientId === currentUser?.id;
  const isAgent = (b: Booking) => b.agentId === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white font-heading">
            My Campus Bookings & Escrow
          </h1>
          <p className="text-xs text-slate-400">
            Lifecycle state machine with double-entry escrow protection and conflict checks.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize cursor-pointer ${
                filterTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <CalendarDays className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">No bookings in this category.</p>
          <p className="text-xs mt-1">
            Browse verified campus helpers or use the AI Assistant to book your first peer session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 shadow-xl transition-all space-y-4"
            >
              {/* Top Row: Service Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">{b.serviceTitle}</h3>
                    <p className="text-[11px] text-slate-400">
                      Booking #{b.id} · Scheduled {new Date(b.scheduledStart).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(b.status)}</div>
              </div>

              {/* Visual State Machine Timeline */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
                {getTimelineSteps(b.status)}
              </div>

              {/* Middle Row: Participants, Date/Time, Location, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Peer Info */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {isClient(b) ? 'Peer Helper' : 'Student Client'}
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={isClient(b) ? b.agentAvatar : b.clientAvatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <p className="font-semibold text-white">{isClient(b) ? b.agentName : b.clientName}</p>
                      <p className="text-[11px] text-slate-400">
                        {isClient(b) ? b.agentMajor : b.clientDorm.split(',')[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Scheduled Slot
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      {new Date(b.scheduledStart).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(b.scheduledStart).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Duration: {b.durationHours} hr{b.durationHours > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Campus Location */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Campus Location
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{b.campusLocation}</span>
                  </div>
                  {b.notes && (
                    <span className="text-[11px] text-slate-400 block mt-0.5 truncate" title={b.notes}>
                      Note: {b.notes}
                    </span>
                  )}
                </div>

                {/* Escrow Financials */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Escrow Amount
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-cyan-400">
                      ${(b.priceSnapshot.totalMinor / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (${((b.priceSnapshot.rateMinor * b.durationHours) / 100).toFixed(2)} + 10% fee)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                    {b.status === 'closed'
                      ? 'Funds Released'
                      : b.status === 'confirmed' || b.status === 'in_progress'
                      ? 'Secured in Escrow'
                      : 'Pending Deposit'}
                  </span>
                </div>
              </div>

              {/* State Machine Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {/* Chat button */}
                  <button
                    onClick={() => onOpenChat(b.id)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>In-Booking Chat</span>
                  </button>

                  {/* Safety / Dispute button */}
                  {['confirmed', 'in_progress', 'completed'].includes(b.status) && (
                    <button
                      onClick={() => onOpenDispute(b)}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Report Concern</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* ACTION: Helper Accept/Decline */}
                  {b.status === 'requested' && isAgent(b) && (
                    <>
                      <button
                        onClick={() => handleAction(b.id, () => api.declineBooking(b.id, 'Helper schedule conflict'))}
                        disabled={actionLoading === b.id}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAction(b.id, () => api.acceptBooking(b.id), true)}
                        disabled={actionLoading === b.id}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                      >
                        Accept Request
                      </button>
                    </>
                  )}

                  {/* ACTION: Client Pay into Escrow */}
                  {b.status === 'accepted' && isClient(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.payBookingEscrow(b.id), true)}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Deposit ${(b.priceSnapshot.totalMinor / 100).toFixed(2)} in Escrow</span>
                    </button>
                  )}

                  {/* ACTION: Helper Start Session */}
                  {b.status === 'confirmed' && isAgent(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.startBooking(b.id))}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Check In & Start Session</span>
                    </button>
                  )}

                  {/* ACTION: Helper Mark Completed */}
                  {b.status === 'in_progress' && isAgent(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.completeBooking(b.id), true)}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Work Completed</span>
                    </button>
                  )}

                  {/* ACTION: Client Confirm Completion & Release Escrow */}
                  {b.status === 'completed' && isClient(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.confirmCompletion(b.id), true)}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Done & Release Escrow</span>
                    </button>
                  )}

                  {/* ACTION: Client Write Review */}
                  {(b.status === 'completed' || b.status === 'closed') && isClient(b) && !b.isReviewed && (
                    <button
                      onClick={() => onOpenReview(b)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Leave Review</span>
                    </button>
                  )}

                  {/* ACTION: Cancel */}
                  {['requested', 'accepted', 'confirmed'].includes(b.status) && (
                    <button
                      onClick={() => {
                        const reason = prompt('Please enter cancellation reason:');
                        if (reason) {
                          handleAction(b.id, () => api.cancelBooking(b.id, reason));
                        }
                      }}
                      className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px] font-medium"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
