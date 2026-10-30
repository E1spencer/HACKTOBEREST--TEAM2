import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api.ts';
import { RankedAgent } from '../types/marketplace.ts';

interface BookingModalProps {
  agent: RankedAgent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ agent, onClose, onSuccess }) => {
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('15:00');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [campusLocation, setCampusLocation] = useState(agent?.baseCampusZone || 'Kendall Residence Hall, Room 312');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!agent) return null;

  const rateMinor = agent.pricePerHourMinor || 2000;
  const subtotalMinor = rateMinor * durationHours;
  const platformFeeMinor = Math.round(subtotalMinor * 0.1);
  const totalMinor = subtotalMinor + platformFeeMinor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const startDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    try {
      await api.createBooking({
        agentId: agent.agentId,
        agentServiceId: agent.serviceId,
        scheduledStart: startDateTime,
        durationHours,
        campusLocation,
        notes,
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
          <img
            src={agent.photoUrl}
            alt=""
            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-indigo-500/40"
          />
          <div>
            <h2 className="text-base font-extrabold text-white font-heading">Book Peer Session</h2>
            <p className="text-xs text-slate-400">
              with {agent.displayName} · {agent.major}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-rose-950/60 border border-rose-500/40 text-rose-200 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Service Snapshot */}
          <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
              Requested Service
            </span>
            <p className="text-xs font-bold text-white mt-0.5">{agent.serviceTitle}</p>
            <p className="text-[11px] text-cyan-400 mt-0.5 font-bold">${(rateMinor / 100).toFixed(2)} / hr</p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Session Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Start Time</label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Duration & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Duration</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value={1}>1 hour session</option>
                <option value={2}>2 hours session</option>
                <option value={3}>3 hours session</option>
                <option value={4}>4 hours session</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Campus Location / Dorm</label>
              <input
                type="text"
                required
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                placeholder="e.g. Library Rm 204 or Kendall Hall 312"
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Specific topics, chapter names, stairs to carry items down..."
              className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Price Breakdown Snapshot */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transparent Price Breakdown
            </span>
            <div className="flex justify-between text-slate-300">
              <span>
                ${(rateMinor / 100).toFixed(2)} × {durationHours} hr{durationHours > 1 ? 's' : ''}
              </span>
              <span>${(subtotalMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>CampusHelp Platform Fee (10%)</span>
              <span>${(platformFeeMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/10 text-sm font-heading">
              <span>Total Escrow Deposit</span>
              <span className="text-cyan-400">${(totalMinor / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Escrow Guarantee Notice */}
          <div className="flex items-start gap-2.5 text-[11px] text-slate-300 bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-emerald-300">Campus Escrow Guarantee:</strong> Payment is only deposited after {agent.displayName} accepts, and funds remain safely in escrow until you confirm completion.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {loading ? 'Submitting Request...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
