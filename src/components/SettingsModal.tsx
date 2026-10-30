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

    // Save temporarily
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Google Gemma & OpenRouter Settings</h2>
            <p className="text-xs text-slate-500">
              Configure OpenRouter API parameters utilizing the OpenAI SDK backend.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* OpenRouter API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>OpenRouter API Key</span>
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Stored securely in local session. If omitted, the applet automatically uses configured environment keys or semantic intent fallback.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Google Gemma Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
            >
              <option value="google/gemma-2-9b-it">google/gemma-2-9b-it (Google Gemma 2 9B Instruct - Recommended)</option>
              <option value="google/gemma-3-12b-it">google/gemma-3-12b-it (Google Gemma 3 12B Instruct)</option>
              <option value="google/gemma-2-27b-it">google/gemma-2-27b-it (Google Gemma 2 27B Instruct)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (Gemini OpenAI Compatibility)</option>
            </select>
          </div>

          {/* Architecture info note */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Enterprise ADR-005 Multi-Tier Reliability
            </span>
            <p>
              1. <strong>Primary:</strong> OpenRouter Gemma via OpenAI SDK (<code className="bg-slate-200 px-1 rounded">https://openrouter.ai/api/v1</code>).
            </p>
            <p>
              2. <strong>Secondary:</strong> Generative Language OpenAI Compatibility endpoint with <code className="bg-slate-200 px-1 rounded">GEMINI_API_KEY</code>.
            </p>
            <p>
              3. <strong>Offline High-Availability:</strong> Deterministic semantic extraction ensuring 100% continuous uptime.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testStatus === 'testing'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  : testStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testStatus === 'testing' && <Zap className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold">{testMessage}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Test Connection</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
