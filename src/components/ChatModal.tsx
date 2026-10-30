import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api.ts';
import { Message, Conversation, User } from '../types/marketplace.ts';

interface ChatModalProps {
  bookingId: string;
  currentUser: User | null;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ bookingId, currentUser, onClose }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputBody, setInputBody] = useState('');
  const [warningBanner, setWarningBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const loadChat = async () => {
    try {
      const bookingData = await api.getBooking(bookingId);
      if (bookingData.conversationId) {
        const res = await api.getMessages(bookingData.conversationId);
        setConversation(res.conversation);
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBody.trim() || !conversation) return;

    try {
      const res = await api.sendMessage(conversation.id, inputBody);
      setInputBody('');
      if (res.warningBanner) {
        setWarningBanner(res.warningBanner);
      } else {
        setWarningBanner(null);
      }
      loadChat();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel bg-slate-900 rounded-3xl max-w-lg w-full h-[540px] shadow-2xl flex flex-col overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-heading">
                In-Booking Live Chat · #{bookingId}
              </h3>
              <p className="text-[10px] text-slate-400">
                {conversation?.serviceTitle || 'Peer Coordination'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Anti-Leakage Notice Banner */}
        {warningBanner && (
          <div className="bg-amber-950/80 border-b border-amber-500/40 p-2.5 text-[11px] text-amber-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{warningBanner}</p>
              <p className="text-[10px] text-amber-300">
                External payments void your student money-back guarantee.
              </p>
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-8">Loading message history...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="font-semibold text-white font-heading">Secure conversation initialized</p>
              <p className="text-[11px] mt-0.5">Coordinate meeting hall, arrival time, or materials needed.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUser?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-500 mb-0.5 px-1 font-medium">
                    {isMine ? 'You' : m.senderName} ·{' '}
                    {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-xs'
                    }`}
                  >
                    {m.body}
                  </div>
                  {m.isFlaggedForLeakage && (
                    <span className="text-[9px] text-amber-400 mt-0.5 px-1 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Off-platform contact flagged by safety filter
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputBody}
            onChange={(e) => setInputBody(e.target.value)}
            placeholder="Type message (e.g. 'I am outside Kendall Hall Room 204')..."
            className="flex-1 bg-slate-800 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputBody.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
