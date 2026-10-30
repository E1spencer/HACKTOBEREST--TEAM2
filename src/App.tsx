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
} from 'lucide-react';

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

    // Smart route switch based on role
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        onOpenSettings={() => setShowSettings(true)}
        onResetSeed={handleResetSeed}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
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
