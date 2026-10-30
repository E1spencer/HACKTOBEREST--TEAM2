import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Star,
  ShieldCheck,
  ArrowRight,
  Bot,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api.ts';
import { AiMatchResult, RankedAgent } from '../types/marketplace.ts';

interface AiMatchingPanelProps {
  onBookAgent: (agent: RankedAgent) => void;
  onOpenSettings: () => void;
}

export const AiMatchingPanel: React.FC<AiMatchingPanelProps> = ({ onBookAgent, onOpenSettings }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AiMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const presetScenarios = [
    {
      title: 'CS106 Python Recursion',
      tag: 'STEM Tutoring',
      prompt: 'I need a Python tutor for CS106 recursion midterm tonight under $25/hr',
    },
    {
      title: 'Kendall Hall Fridge Move',
      tag: 'Heavy Lifting',
      prompt: 'Need strong student to help carry a mini-fridge down Kendall Hall stairs',
    },
    {
      title: 'North Quad Laundry Wash',
      tag: 'Laundry & Fold',
      prompt: 'Looking for laundry wash & fold pickup in North Quad today',
    },
    {
      title: 'History Essay Proofreading',
      tag: 'Writing Polish',
      prompt: 'Need senior peer to proofread my 8-page History term paper draft',
    },
    {
      title: 'Eduroam WiFi Setup & Fix',
      tag: 'Campus Tech',
      prompt: 'Eduroam campus WiFi troubleshooting and malware cleanup on MacBook',
    },
  ];

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setProgressPercent(15);
    setLoadingStep('Extracting structured student intent with Google Gemma...');

    const timer1 = setTimeout(() => {
      setProgressPercent(50);
      setLoadingStep('Querying verified Oakwood campus helpers & availability...');
    }, 350);

    const timer2 = setTimeout(() => {
      setProgressPercent(85);
      setLoadingStep('Calculating Bayesian reputation scores and proximity...');
    }, 750);

    try {
      const res = await api.matchWithAi(q);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressPercent(100);
      setMatchResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to match helpers. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Animated Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl glow-indigo"
      >
        {/* Glow Spheres */}
        <div className="absolute top-0 right-1/4 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-4 backdrop-blur-md">
            <Bot className="w-3.5 h-3.5 text-cyan-300" />
            <span>Google Gemma (OpenRouter OpenAI SDK)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Active</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 font-heading leading-tight">
            Describe what you need on campus.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal">
            Type anything in plain language. Our AI assistant analyzes your request, verifies student availability, and returns a ranked shortlist. <span className="text-indigo-300 font-medium">You choose; AI never books or charges automatically.</span>
          </p>

          {/* Interactive Search Bar */}
          <div className="glass-panel p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2">
            <div className="pl-3 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Need Python tutor for CS midterm tonight under $25/hr or help moving fridge..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {isLoading ? (
                <span>Analyzing...</span>
              ) : (
                <>
                  <span>Match Peers</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Interactive One-Click Preset Prompt Chips */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Instant Preset Scenarios:</span>
              <span className="text-[11px] text-slate-500">(Click to auto-fill & run live match)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetScenarios.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(scen.prompt);
                    handleSearch(scen.prompt);
                  }}
                  className="group px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-400/40 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block group-hover:text-cyan-300">
                    {scen.tag}
                  </span>
                  <span className="text-xs text-slate-200 font-medium group-hover:text-white">
                    {scen.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading Stepper Animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl p-6 border border-indigo-500/30 shadow-xl overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
                  {loadingStep}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
                  initial={{ width: '10%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Calling OpenRouter Google Gemma endpoint with OpenAI SDK client · Zero Hallucination Guarantee
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-2xl p-4 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-[11px] text-rose-300 mt-0.5">
              Check your OpenRouter API key in Gemma Settings or try another search prompt.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 border border-rose-500/40 rounded-xl text-rose-200 font-semibold text-xs"
          >
            Settings
          </button>
        </div>
      )}

      {/* Match Results */}
      {matchResult && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Interpreted Request Summary Chips */}
          {matchResult.interpretedRequest && (
            <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-heading">
                    Interpreted Student Request
                  </span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                    {matchResult.modelUsed}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Execution Latency: {matchResult.executionMs}ms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Category Match
                  </span>
                  <span className="font-bold text-white block truncate">
                    {matchResult.interpretedRequest.categoryName}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Timing Hint
                  </span>
                  <span className="font-bold text-white block truncate">
                    {matchResult.interpretedRequest.schedule}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Target Campus Hall
                  </span>
                  <span className="font-bold text-white block truncate">
                    {matchResult.interpretedRequest.location}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Budget Target
                  </span>
                  <span className="font-bold text-emerald-400 block truncate">
                    {matchResult.interpretedRequest.budget}
                  </span>
                </div>
              </div>

              {matchResult.relaxationsApplied.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2 text-[11px] text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>
                    Auto-relaxed constraints for best candidate match: {matchResult.relaxationsApplied.join(' · ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Clarification Box */}
          {matchResult.type === 'clarification' && matchResult.clarifyingQuestion && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 text-amber-200">
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Quick Clarification</span>
              </div>
              <p className="text-xs text-amber-100 mb-3">{matchResult.clarifyingQuestion}</p>
              <div className="flex gap-2 flex-wrap">
                {['Calculus Peer Tutor', 'Python & Code Review', 'Dorm Room Moving', 'Laundry Wash & Fold'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setQuery(`${query} - specifically ${opt}`);
                      handleSearch(`${query} - specifically ${opt}`);
                    }}
                    className="px-3 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-500/40 rounded-xl text-xs font-semibold text-white transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Helper Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-white font-heading">
                  Verified Peer Helpers ({matchResult.agents.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Ranked deterministically using text match, Bayesian rating, completion track record, and campus proximity.
                </p>
              </div>
              <span className="text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 font-semibold px-2.5 py-1 rounded-full">
                AI Match · Student Selects
              </span>
            </div>

            {matchResult.agents.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-xs text-slate-400">
                <p className="font-semibold text-slate-200">No active student helpers matched this query.</p>
                <p className="mt-1">Try one of the preset prompts above or widen your quad area.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {matchResult.agents.map((agent, index) => (
                  <motion.div
                    key={agent.agentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <div className="relative">
                          <img
                            src={agent.photoUrl}
                            alt={agent.displayName}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400 transition-all shrink-0"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] text-white">
                            ✓
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white truncate font-heading group-hover:text-indigo-300 transition-colors">
                              {agent.displayName}
                            </h3>
                            <span className="text-sm font-extrabold text-cyan-400">
                              ${(agent.pricePerHourMinor / 100).toFixed(0)}/hr
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {agent.yearOfStudy} · {agent.major}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {agent.rating.toFixed(1)}
                            </span>
                            <span>·</span>
                            <span>{agent.reviewCount} reviews</span>
                            <span>·</span>
                            <span className="text-emerald-400 font-medium">{agent.completionRate}% completion</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Box */}
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 mb-3.5">
                        <p className="text-xs font-semibold text-white line-clamp-1">
                          {agent.serviceTitle}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">Quad: {agent.baseCampusZone}</span>
                        </div>
                      </div>

                      {/* Verified Match Reasons */}
                      <div className="space-y-1.5 mb-4">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          Verified Campus Proof
                        </span>
                        {agent.matchReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <button
                      onClick={() => onBookAgent(agent)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      <span>Book with {agent.displayName.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
