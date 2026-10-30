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
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const navItems = [
    { id: 'ai-assistant', label: 'AI Match', icon: Sparkles, color: 'text-indigo-400' },
    { id: 'catalog', label: 'Browse Helpers', icon: Search, color: 'text-slate-300' },
    { id: 'bookings', label: 'Bookings & Escrow', icon: CalendarDays, color: 'text-cyan-400' },
    { id: 'helper-portal', label: 'Helper Workspace', icon: Briefcase, color: 'text-emerald-400' },
    { id: 'admin', label: 'Trust & Admin', icon: ShieldCheck, color: 'text-amber-400' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange('ai-assistant')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 font-heading">
                  CampusHelp
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Gemma 2
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5">Oakwood University Peer Network</span>
              </div>
            </button>

            {/* Desktop Navigation Tabs with Animated Pill */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-indigo-600 rounded-lg shadow-sm shadow-indigo-500/40"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools: Role Switcher & Notifications & Settings */}
          <div className="flex items-center gap-2.5">
            {/* OpenRouter Config Button */}
            <button
              onClick={onOpenSettings}
              title="Configure OpenRouter Gemma Key and Model"
              className="p-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium border border-white/10"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Gemma Settings</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg transition-colors relative border border-white/10"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 glass-panel bg-slate-900/95 rounded-2xl shadow-2xl border border-white/10 p-3.5 z-50"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                      <span className="text-xs font-bold text-white font-heading">Campus Alerts</span>
                      <span className="text-[11px] text-indigo-400 font-medium">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No campus notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                              n.readAt
                                ? 'bg-slate-800/40 text-slate-400'
                                : 'bg-indigo-950/60 border border-indigo-500/30 text-white'
                            }`}
                          >
                            <p className="font-semibold text-white flex items-center justify-between">
                              {n.title}
                              {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">{n.body}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Campus Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-colors text-left"
              >
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-white block leading-tight font-heading">
                    {currentUser?.displayName || 'Select User'}
                  </span>
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-semibold">
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
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 glass-panel bg-slate-900/95 rounded-2xl shadow-2xl border border-white/10 p-2.5 z-50"
                  >
                    <div className="px-2 py-1.5 border-b border-white/10 mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Switch Persona
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Test Client, Helper & Admin workflows
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
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                            currentUser?.id === u.id
                              ? 'bg-indigo-600/30 border border-indigo-500/40 text-white font-semibold'
                              : 'hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <div>
                              <span className="block font-medium text-white">{u.displayName}</span>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {u.role} · {u.campusDorm.split(',')[0]}
                              </span>
                            </div>
                          </div>
                          {currentUser?.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          onResetSeed();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-400" />
                        Reset Demo Seed Data
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-white/5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
