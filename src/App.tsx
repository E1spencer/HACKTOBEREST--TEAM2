/**
 * CampusHelp - College Student Peer Services Marketplace & AI Assistant
 * Enterprise-grade architecture built with React, Node.js, and Google Gemma via OpenRouter & OpenAI SDK
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { AiMatchingPanel } from './components/AiMatchingPanel.tsx';
import { BrowseCatalog } from './components/BrowseCatalog.tsx';
import { BookingsView } from './components/BookingsView.tsx';
import { HelperPortal } from './components/HelperPortal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { ChatModal } from './components/ChatModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { DisputeModal } from './components/DisputeModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { api } from './lib/api.ts';
import { User, Booking, RankedAgent } from './types/marketplace.ts';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  CalendarDays,
  Briefcase,
  Layers,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('ai-assistant');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookingAgent, setBookingAgent] = useState<RankedAgent | null>(null);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [activeDisputeBooking, setActiveDisputeBooking] = useState<Booking | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const meRes = await api.getMe();
      setCurrentUser(meRes.user);
    } catch (e) {
      console.error('Failed to load initial user:', e);
    }
  };

  const handleUserSwitch = async (user: User) => {
    api.setUserId(user.id);
    setCurrentUser(user);
    showToast(`Switched active persona to ${user.displayName} (${user.role.toUpperCase()})`);

    if (user.role === 'agent' && currentTab === 'ai-assistant') {
      setCurrentTab('helper-portal');
    } else if (user.role === 'admin' && currentTab !== 'admin') {
      setCurrentTab('admin');
    }
  };

  const handleResetSeed = async () => {
    try {
      await api.resetDevSeed();
      showToast('Database successfully re-seeded to initial state.');
      initApp();
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans bg-grid-pattern selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        onOpenSettings={() => setShowSettings(true)}
        onResetSeed={handleResetSeed}
      />

      {/* Preset Quick Explore Bar */}
      <div className="border-b border-white/5 bg-slate-900/40 backdrop-blur-md py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white text-[11px] uppercase tracking-wider font-heading">
              Oakwood Live:
            </span>
            <span className="text-slate-400 text-[11px]">142 peer helpers verified today</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500 text-[11px]">Quick Demos:</span>
            <button
              onClick={() => {
                setCurrentTab('bookings');
                showToast('Jumped to active Escrow booking demo!');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>$55.00 Escrow Held Demo</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                setCurrentTab('helper-portal');
                showToast('Opened Student Helper Workspace & Wallet');
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Helper Wallet & Jobs</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                setCurrentTab('admin');
                showToast('Opened Trust & Safety Administration Portal');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Trust & Safety Desk</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {currentTab === 'ai-assistant' && (
          <AiMatchingPanel
            onBookAgent={(agent) => setBookingAgent(agent)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {currentTab === 'catalog' && (
          <BrowseCatalog
            onBookAgent={(agent) => setBookingAgent(agent)}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingsView
            currentUser={currentUser}
            onOpenChat={(id) => setActiveChatBookingId(id)}
            onOpenReview={(b) => setActiveReviewBooking(b)}
            onOpenDispute={(b) => setActiveDisputeBooking(b)}
          />
        )}

        {currentTab === 'helper-portal' && (
          <HelperPortal
            currentUser={currentUser}
            onOpenChat={(id) => setActiveChatBookingId(id)}
          />
        )}

        {currentTab === 'admin' && <AdminPortal />}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 glass-panel bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {bookingAgent && (
        <BookingModal
          agent={bookingAgent}
          onClose={() => setBookingAgent(null)}
          onSuccess={() => {
            setBookingAgent(null);
            setCurrentTab('bookings');
            showToast('Booking request submitted! Waiting for helper confirmation.');
          }}
        />
      )}

      {activeChatBookingId && (
        <ChatModal
          bookingId={activeChatBookingId}
          currentUser={currentUser}
          onClose={() => setActiveChatBookingId(null)}
        />
      )}

      {activeReviewBooking && (
        <ReviewModal
          booking={activeReviewBooking}
          onClose={() => setActiveReviewBooking(null)}
          onSuccess={() => {
            setActiveReviewBooking(null);
            showToast('Review submitted! Peer helper reputation updated.');
          }}
        />
      )}

      {activeDisputeBooking && (
        <DisputeModal
          booking={activeDisputeBooking}
          onClose={() => setActiveDisputeBooking(null)}
          onSuccess={() => {
            setActiveDisputeBooking(null);
            setCurrentTab('bookings');
            showToast('Dispute opened. Escrow funds frozen for Dean of Students review.');
          }}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 mt-16 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white font-heading">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span>CampusHelp · Oakwood University Student Marketplace</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Google Gemma AI Matching (OpenRouter & OpenAI SDK)</span>
            <span>·</span>
            <span>100% Escrow Backed</span>
            <span>·</span>
            <span>Strict Student ID Verification</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
