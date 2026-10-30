import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Search,
  CalendarDays,
  Briefcase,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { User, Notification } from '../types/marketplace.ts';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User | null;
  onUserSwitch: (user: User) => void;
  onOpenSettings: () => void;
  onResetSeed: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onUserSwitch,
  onOpenSettings,
  onResetSeed,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, [currentUser?.id]);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.users);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.notifications.filter((n) => !n.readAt).length);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onTabChange('ai-assistant')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  CampusHelp
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Gemma AI
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 block -mt-0.5">Oakwood University Peer Network</span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onTabChange('ai-assistant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentTab === 'ai-assistant'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                AI Match Assistant
              </button>

              <button
                onClick={() => onTabChange('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentTab === 'catalog'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Browse Helpers
              </button>

              <button
                onClick={() => onTabChange('bookings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentTab === 'bookings'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                My Bookings & Escrow
              </button>

              <button
                onClick={() => onTabChange('helper-portal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentTab === 'helper-portal'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                Helper Workspace
              </button>

              <button
                onClick={() => onTabChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Trust & Admin
              </button>
            </nav>
          </div>

          {/* Right Action Tools: Role Switcher & Notifications & Settings */}
          <div className="flex items-center gap-2.5">
            {/* OpenRouter Config Button */}
            <button
              onClick={onOpenSettings}
              title="Configure OpenRouter Gemma Key and Model"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium border border-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Gemma AI Settings</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-900">Campus Alerts</span>
                    <span className="text-[11px] text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No campus notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            n.readAt ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/70 text-slate-900 font-medium'
                          }`}
                        >
                          <p className="font-semibold text-slate-900 flex items-center justify-between">
                            {n.title}
                            {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{n.body}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Campus Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-semibold text-slate-900 block leading-tight">
                    {currentUser?.displayName || 'Select User'}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    {currentUser?.role === 'client'
                      ? 'Student Client'
                      : currentUser?.role === 'agent'
                      ? 'Peer Helper'
                      : 'Campus Admin'}
                  </span>
                </div>
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Switch Demo Persona
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Experience buyer, seller, and administrator views
                    </span>
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onUserSwitch(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          currentUser?.id === u.id ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <span className="block font-medium">{u.displayName}</span>
                            <span className="text-[10px] text-slate-500 capitalize">{u.role} · {u.campusDorm.split(',')[0]}</span>
                          </div>
                        </div>
                        {currentUser?.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onResetSeed();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 rounded transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Demo Seed Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
