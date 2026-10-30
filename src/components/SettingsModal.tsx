import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Key,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api.ts';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const currentConfig = api.getOpenRouterConfig();
  const [apiKey, setApiKey] = useState(currentConfig.key);
  const [model, setModel] = useState(currentConfig.model);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  const handleSave = () => {
    api.setOpenRouterConfig(apiKey.trim(), model);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Sending test query to Google Gemma via OpenRouter & OpenAI SDK...');

    api.setOpenRouterConfig(apiKey.trim(), model);

    try {
      const res = await api.matchWithAi('Calculus tutor needed for midterm', {
        openRouterApiKey: apiKey.trim(),
        model,
      });

      setTestStatus('success');
      setTestMessage(
        `Connection verified! Engine: ${res.modelUsed}. Latency: ${res.executionMs}ms. Categorized as: ${res.interpretedRequest?.categoryName || 'STEM'}.`
      );
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Connection test failed. Verify your OpenRouter key.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4 border border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white font-heading">Google Gemma & OpenRouter Settings</h2>
            <p className="text-xs text-slate-400">
              Configure OpenRouter API parameters utilizing the OpenAI SDK backend.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* OpenRouter API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>OpenRouter API Key</span>
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Get a key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Stored securely in local session. If omitted, the applet automatically uses configured environment keys or semantic intent fallback.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">Google Gemma Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="google/gemma-2-9b-it">google/gemma-2-9b-it (Google Gemma 2 9B Instruct - Recommended)</option>
              <option value="google/gemma-3-12b-it">google/gemma-3-12b-it (Google Gemma 3 12B Instruct)</option>
              <option value="google/gemma-2-27b-it">google/gemma-2-27b-it (Google Gemma 2 27B Instruct)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (Gemini OpenAI Compatibility)</option>
            </select>
          </div>

          {/* Architecture note */}
          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-white/5 space-y-1.5 text-[11px] text-slate-300">
            <span className="font-bold text-white flex items-center gap-1.5 font-heading">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Enterprise ADR-005 Multi-Tier Reliability
            </span>
            <p>
              1. <strong>Primary:</strong> OpenRouter Gemma via OpenAI SDK (<code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">https://openrouter.ai/api/v1</code>).
            </p>
            <p>
              2. <strong>Secondary:</strong> Generative Language OpenAI Compatibility endpoint with <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">GEMINI_API_KEY</code>.
            </p>
            <p>
              3. <strong>Offline High-Availability:</strong> Deterministic semantic extraction ensuring 100% continuous uptime.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                testStatus === 'testing'
                  ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                  : testStatus === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              {testStatus === 'testing' && <Zap className="w-4 h-4 animate-spin shrink-0 mt-0.5 text-cyan-400" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />}
              <div>
                <p className="font-semibold">{testMessage}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test Connection</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
