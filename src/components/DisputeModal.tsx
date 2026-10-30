import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api.ts';
import { Booking } from '../types/marketplace.ts';

interface DisputeModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ booking, onClose, onSuccess }) => {
  const [reason, setReason] = useState<string>('Helper No-Show / Over 30 mins late');
  const [evidenceText, setEvidenceText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim()) {
      alert('Please explain what occurred.');
      return;
    }

    setLoading(true);
    try {
      await api.openDispute(booking.id, reason, evidenceText);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to open dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Campus Trust & Safety Concern</h2>
            <p className="text-xs text-slate-500">
              Escrow release will be frozen while Dean of Students reviews this booking.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Issue Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
            >
              <option value="Helper No-Show / Over 30 mins late">Helper No-Show (Over 30 mins late)</option>
              <option value="Work Incomplete or Substandard">Work Incomplete or Substandard</option>
              <option value="Belonging Damaged during moving">Belonging Damaged during moving</option>
              <option value="Conduct or Campus Policy Violation">Conduct or Campus Policy Violation</option>
              <option value="Other Safety Concern">Other Safety Concern</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Detailed Explanation & Evidence</label>
            <textarea
              rows={4}
              required
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              placeholder="Describe what happened in detail. Chat logs and timestamps will be automatically cross-referenced by the administrator."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
            <strong>Escrow Freeze Guarantee:</strong> Opening this dispute freezes payment of ${(booking.priceSnapshot.totalMinor / 100).toFixed(2)}. The administrator can issue a full or partial refund to your student account.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              {loading ? 'Submitting...' : 'Freeze Escrow & Open Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
