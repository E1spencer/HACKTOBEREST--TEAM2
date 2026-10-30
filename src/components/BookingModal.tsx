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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <img
            src={agent.photoUrl}
            alt=""
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900">Book Peer Session</h2>
            <p className="text-xs text-slate-500">
              with {agent.displayName} · {agent.major}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Service Snapshot */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              Requested Service
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{agent.serviceTitle}</p>
            <p className="text-[11px] text-indigo-600 mt-0.5">${(rateMinor / 100).toFixed(2)} / hr</p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Session Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Duration & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Duration</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
              >
                <option value={1}>1 hour session</option>
                <option value={2}>2 hours session</option>
                <option value={3}>3 hours session</option>
                <option value={4}>4 hours session</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campus Location / Dorm</label>
              <input
                type="text"
                required
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                placeholder="e.g. Library Rm 204 or Kendall Hall 312"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Specific topics, chapter names, stairs to carry items down..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Price Breakdown Snapshot (Prompt 06 & 09) */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transparent Price Breakdown
            </span>
            <div className="flex justify-between text-slate-600">
              <span>
                ${(rateMinor / 100).toFixed(2)} × {durationHours} hr{durationHours > 1 ? 's' : ''}
              </span>
              <span>${(subtotalMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CampusHelp Platform Fee (10%)</span>
              <span>${(platformFeeMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
              <span>Total Escrow Deposit</span>
              <span className="text-indigo-700">${(totalMinor / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Escrow Guarantee Notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-emerald-800">Campus Escrow Guarantee:</strong> Payment is only charged after {agent.displayName} accepts, and funds are held safely until you confirm completion.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              {loading ? 'Submitting Request...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
