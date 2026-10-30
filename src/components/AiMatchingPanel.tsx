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
  SlidersHorizontal,
  Bot,
  Zap,
} from 'lucide-react';
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

  const quickPrompts = [
    'I need a Python tutor for CS106 recursion midterm tonight under $25/hr',
    'Need strong student to help carry a mini-fridge down Kendall Hall stairs',
    'Looking for laundry wash & fold pickup in North Quad today',
    'Need senior peer to proofread my 8-page History term paper draft',
    'Eduroam campus WiFi troubleshooting and malware cleanup on MacBook',
  ];

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Extracting structured student intent with Google Gemma...');

    const timer1 = setTimeout(() => {
      setLoadingStep('Querying verified Oakwood campus helpers & availability...');
    }, 400);

    const timer2 = setTimeout(() => {
      setLoadingStep('Calculating Bayesian reputation scores and proximity...');
    }, 850);

    try {
      const res = await api.matchWithAi(q);
      clearTimeout(timer1);
      clearTimeout(timer2);
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
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold mb-3">
            <Bot className="w-3.5 h-3.5 text-indigo-300" />
            <span>Google Gemma via OpenRouter & OpenAI SDK</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Describe what you need on campus.
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6">
            CampusHelp's AI assistant extracts your request, constraints, and campus location, then presents a verified shortlist of student helpers. You review and choose — the AI never books or pays automatically.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-xl p-2 shadow-xl flex items-center gap-2 border border-slate-200/40">
            <div className="pl-3 text-slate-400">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Need someone to help move my mini-fridge at Kendall Hall or Calculus II tutor under $22/hr..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <span>Analyzing...</span>
              ) : (
                <>
                  <span>Match Helpers</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-indigo-200 font-medium text-[11px]">Try asking:</span>
            {quickPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(prompt);
                  handleSearch(prompt);
                }}
                className="text-[11px] text-indigo-100/90 bg-indigo-800/60 hover:bg-indigo-700/80 px-2.5 py-1 rounded-md transition-colors border border-indigo-700/50 text-left"
              >
                "{prompt.length > 42 ? prompt.slice(0, 42) + '...' : prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Stepper */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-spin">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{loadingStep}</p>
              <p className="text-[11px] text-slate-500">
                Processing natural language prompt with OpenRouter OpenAI client · Model: Google Gemma
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-[11px] text-rose-600 mt-0.5">
              Check your OpenRouter API key in Gemma AI Settings or try a different campus search prompt.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 bg-white border border-rose-300 rounded text-rose-700 font-medium text-[11px] hover:bg-rose-100"
          >
            Settings
          </button>
        </div>
      )}

      {/* AI Match Results */}
      {matchResult && !isLoading && (
        <div className="space-y-6">
          {/* Interpreted Request Chips (Prompt 11.2) */}
          {matchResult.interpretedRequest && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Interpreted Student Request</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                    {matchResult.modelUsed}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Response latency: {matchResult.executionMs}ms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {matchResult.interpretedRequest.categoryName}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Schedule Hint</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {matchResult.interpretedRequest.schedule}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Quad / Hall</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {matchResult.interpretedRequest.location}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Budget Range</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {matchResult.interpretedRequest.budget}
                  </span>
                </div>
              </div>

              {/* Relaxation notices if any */}
              {matchResult.relaxationsApplied.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>
                    Auto-relaxed constraints to ensure student matches: {matchResult.relaxationsApplied.join(' · ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Clarification quick reply */}
          {matchResult.type === 'clarification' && matchResult.clarifyingQuestion && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Quick Clarification Needed</span>
              </div>
              <p className="text-xs text-amber-800 mb-3">{matchResult.clarifyingQuestion}</p>
              <div className="flex gap-2 flex-wrap">
                {['Calculus Tutor', 'Python / Coding Help', 'Dorm Room Moving', 'Laundry Pickup'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setQuery(`${query} - specifically ${option}`);
                      handleSearch(`${query} - specifically ${option}`);
                    }}
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ranked Agent Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Ranked Student Helpers ({matchResult.agents.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked deterministically using text relevance, Bayesian rating, completion track record, and campus proximity.
                </p>
              </div>
              <span className="text-xs text-indigo-700 bg-indigo-50 font-semibold px-2 py-1 rounded">
                AI-suggested · You choose
              </span>
            </div>

            {matchResult.agents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">No active student helpers matched this specific query.</p>
                <p className="text-xs text-slate-500 mt-1">Try expanding your quad range or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchResult.agents.map((agent) => (
                  <div
                    key={agent.agentId}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Helper Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={agent.photoUrl}
                          alt={agent.displayName}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {agent.displayName}
                            </h3>
                            <span className="text-xs font-bold text-indigo-700">
                              ${(agent.pricePerHourMinor / 100).toFixed(0)}/hr
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate">
                            {agent.yearOfStudy} · {agent.major}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {agent.rating.toFixed(1)}
                            </span>
                            <span>·</span>
                            <span>{agent.reviewCount} reviews</span>
                            <span>·</span>
                            <span>{agent.completionRate}% completion</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Title */}
                      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-3">
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {agent.serviceTitle}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">Base: {agent.baseCampusZone}</span>
                        </div>
                      </div>

                      {/* Verified Match Reasons (Prompt 07 Anti-hallucination) */}
                      <div className="space-y-1.5 mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verified Match Proof
                        </span>
                        {agent.matchReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <button
                      onClick={() => onBookAgent(agent)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Book with {agent.displayName.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
