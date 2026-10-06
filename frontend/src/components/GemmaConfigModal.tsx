import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Globe, CheckCircle2, AlertCircle, RefreshCw, Zap, Server } from 'lucide-react';
import { testAiConnection, saveAiConfig } from '../api';

interface GemmaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: any) => void;
}

export const GemmaConfigModal: React.FC<GemmaConfigModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'google' | 'openai_compatible'>('google');
  const [model, setModel] = useState('gemma-2-27b-it');
  const [customModel, setCustomModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemma_api_key') || '';
    const savedModel = localStorage.getItem('gemma_model') || 'gemma-2-27b-it';
    const savedProvider = (localStorage.getItem('gemma_provider') as any) || 'google';
    const savedBaseUrl = localStorage.getItem('gemma_base_url') || '';

    setApiKey(savedKey);
    setModel(savedModel);
    setProvider(savedProvider);
    setBaseUrl(savedBaseUrl);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const activeModel = model === 'custom' ? customModel : model;
      const res = await testAiConnection({
        apiKey,
        model: activeModel,
        provider,
        baseUrl: baseUrl || undefined
      });
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    const activeModel = model === 'custom' ? customModel : model;
    localStorage.setItem('gemma_api_key', apiKey);
    localStorage.setItem('gemma_model', activeModel);
    localStorage.setItem('gemma_provider', provider);
    localStorage.setItem('gemma_base_url', baseUrl);

    await saveAiConfig({
      apiKey,
      model: activeModel,
      provider,
      baseUrl: baseUrl || undefined
    });

    onConfigSaved({
      apiKey,
      model: activeModel,
      provider,
      baseUrl
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gemma 4 & AI Model Settings</h3>
              <p className="text-xs text-slate-400">Configure your API key to generate answers using live Gemma 4</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`py-2 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                  provider === 'google'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Google AI Studio (Gemma)</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai_compatible')}
                className={`py-2 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                  provider === 'openai_compatible'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4 text-blue-400" />
                <span>Local Ollama / OpenRouter</span>
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>{provider === 'google' ? 'Google AI Studio API Key (GEMMA_API_KEY)' : 'API Key (Optional for Local Ollama)'}</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-normal"
              >
                Get Google Key (Free) ↗
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Your key is sent directly to the local backend and never stored publicly.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Gemma / Gemini Model</span>
              <span className="text-[10px] text-emerald-400 font-normal">Auto-Fallback Enabled</span>
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="gemini-1.5-flash-latest">gemini-1.5-flash-latest (Recommended - Google AI)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Google AI Flash)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Ultra-Fast Next-Gen)</option>
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Gemini 2.0 Experimental)</option>
              <option value="gemini-pro">gemini-pro (Gemini Pro GA)</option>
              <option value="gemma-2-27b-it">gemma-2-27b-it (Gemma 2 27B Instruct)</option>
              <option value="gemma-2-9b-it">gemma-2-9b-it (Gemma 2 9B Instruct)</option>
              <option value="custom">Custom Model Name / Endpoint...</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              If a specific model name is unavailable on your key, the engine will automatically discover and switch to an active model.
            </p>
          </div>

          {model === 'custom' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custom Model Identifier</label>
              <input
                type="text"
                value={customModel}
                onChange={e => setCustomModel(e.target.value)}
                placeholder="e.g. gemma-4 or google/gemma-2-27b-it"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Base URL (if openai-compatible or custom) */}
          {provider === 'openai_compatible' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">API Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434/v1 (Ollama) or https://openrouter.ai/api/v1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Test Connection Output */}
          {testResult && (
            <div className={`p-3 rounded-xl border font-mono text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              <div className="overflow-hidden">
                <strong>{testResult.success ? '✓ Gemma 4 Connected Successfully:' : 'Connection Error:'}</strong>
                <p className="mt-0.5 break-words">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20"
            >
              Save & Activate Gemma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
