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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
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

  const handleAction = async (bookingId: string, actionFn: () => Promise<any>) => {
    setActionLoading(bookingId);
    try {
      await actionFn();
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
          <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded">
            Waiting for Helper Acceptance
          </span>
        );
      case 'accepted':
        return (
          <span className="text-blue-700 bg-blue-50 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded">
            Accepted · Ready for Escrow Payment
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Payment Held in Escrow
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3 text-indigo-600" />
            Session In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="text-teal-700 bg-teal-50 border border-teal-200 text-[11px] font-bold px-2 py-0.5 rounded">
            Work Finished · Awaiting Student Release
          </span>
        );
      case 'closed':
        return (
          <span className="text-slate-600 bg-slate-100 border border-slate-200 text-[11px] font-bold px-2 py-0.5 rounded">
            Closed & Escrow Released
          </span>
        );
      case 'disputed':
        return (
          <span className="text-rose-700 bg-rose-50 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded">
            Under Campus Trust Review
          </span>
        );
      default:
        return (
          <span className="text-slate-600 bg-slate-100 text-[11px] font-bold px-2 py-0.5 rounded capitalize">
            {status}
          </span>
        );
    }
  };

  const isClient = (b: Booking) => b.clientId === currentUser?.id;
  const isAgent = (b: Booking) => b.agentId === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Campus Bookings & Escrow</h1>
          <p className="text-xs text-slate-500">
            Lifecycle state machine with double-entry escrow protection and conflict checks.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                filterTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading your bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No bookings in this category.</p>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified campus helpers or use the AI Assistant to book your first peer session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Row: Service Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{b.serviceTitle}</h3>
                    <p className="text-[11px] text-slate-500">
                      Booking #{b.id} · Created {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(b.status)}</div>
              </div>

              {/* Middle Row: Participants, Date/Time, Location, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {/* Peer Info */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {isClient(b) ? 'Your Student Helper' : 'Student Client'}
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={isClient(b) ? b.agentAvatar : b.clientAvatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{isClient(b) ? b.agentName : b.clientName}</p>
                      <p className="text-[11px] text-slate-500">
                        {isClient(b) ? b.agentMajor : b.clientDorm.split(',')[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Scheduled Time
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Duration: {b.durationHours} hr{b.durationHours > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Campus Location */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Campus Location
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.campusLocation}</span>
                  </div>
                  {b.notes && (
                    <span className="text-[11px] text-slate-500 block mt-0.5 truncate" title={b.notes}>
                      Note: {b.notes}
                    </span>
                  )}
                </div>

                {/* Escrow Financials */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Total Escrow Hold
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-900">
                      ${(b.priceSnapshot.totalMinor / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      (${((b.priceSnapshot.rateMinor * b.durationHours) / 100).toFixed(2)} + 10% fee)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                    {b.status === 'closed'
                      ? 'Funds Released'
                      : b.status === 'confirmed' || b.status === 'in_progress'
                      ? 'Secure in Escrow'
                      : 'Pending Deposit'}
                  </span>
                </div>
              </div>

              {/* State Machine Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Chat button */}
                  <button
                    onClick={() => onOpenChat(b.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>In-Booking Chat</span>
                  </button>

                  {/* Safety / Dispute button */}
                  {['confirmed', 'in_progress', 'completed'].includes(b.status) && (
                    <button
                      onClick={() => onOpenDispute(b)}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Report Issue</span>
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
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAction(b.id, () => api.acceptBooking(b.id))}
                        disabled={actionLoading === b.id}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Accept Request
                      </button>
                    </>
                  )}

                  {/* ACTION: Client Pay into Escrow */}
                  {b.status === 'accepted' && isClient(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.payBookingEscrow(b.id))}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
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
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Check In & Start Session</span>
                    </button>
                  )}

                  {/* ACTION: Helper Mark Completed */}
                  {b.status === 'in_progress' && isAgent(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.completeBooking(b.id))}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Work Completed</span>
                    </button>
                  )}

                  {/* ACTION: Client Confirm Completion & Release Escrow */}
                  {b.status === 'completed' && isClient(b) && (
                    <button
                      onClick={() => handleAction(b.id, () => api.confirmCompletion(b.id))}
                      disabled={actionLoading === b.id}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Done & Release Escrow</span>
                    </button>
                  )}

                  {/* ACTION: Client Write Review */}
                  {(b.status === 'completed' || b.status === 'closed') && isClient(b) && !b.isReviewed && (
                    <button
                      onClick={() => onOpenReview(b)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Leave Review</span>
                    </button>
                  )}

                  {/* ACTION: Cancel (Subject to cancellation policy) */}
                  {['requested', 'accepted', 'confirmed'].includes(b.status) && (
                    <button
                      onClick={() => {
                        const reason = prompt('Please enter cancellation reason:');
                        if (reason) {
                          handleAction(b.id, () => api.cancelBooking(b.id, reason));
                        }
                      }}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
