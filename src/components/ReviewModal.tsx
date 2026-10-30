import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api.ts';
import { Booking } from '../types/marketplace.ts';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Patient Tutor', 'Punctual']);
  const [loading, setLoading] = useState<boolean>(false);

  if (!booking) return null;

  const availableTags = [
    'Patient Tutor',
    'Punctual',
    'Clear Explanations',
    'Super Fast',
    'A+ Exam Prep',
    'Careful Lifter',
    'Clean Fold',
    'Friendly Peer',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please write a brief comment about your experience.');
      return;
    }

    setLoading(true);
    try {
      await api.submitReview(booking.id, rating, comment, selectedTags);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
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
        className="glass-panel bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 border border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-extrabold text-white font-heading">Review Peer Session</h2>
          <p className="text-xs text-slate-400">
            Rate your experience with {booking.agentName} for "{booking.serviceTitle}".
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star Picker */}
          <div>
            <label className="font-semibold text-slate-300 block mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-amber-400 text-sm font-heading">{rating}.0 / 5.0</span>
            </div>
          </div>

          {/* Tag Selection */}
          <div>
            <label className="font-semibold text-slate-300 block mb-2">What went great?</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Detailed Feedback</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did this peer helper assist you? Mention their punctuality, clarity, and care."
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
