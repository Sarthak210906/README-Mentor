import React, { useState } from 'react';
import { ProjectTask, GenerationResponse } from '../types';
import { generateBaseline, generateSkill } from '../api';
import { 
  Sparkles, Bot, ShieldCheck, RefreshCw, Copy, Check, Sliders, ArrowRight, 
  ArrowLeft, Eye, Code, Layers, MessageSquare, Terminal, Zap, FileText, CheckCircle2 
} from 'lucide-react';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { ScoreCard } from '../components/ScoreCard';

export const GeneratorPage: React.FC = () => {
  // Preloaded Demo Task (College Event Management System from Requirement 22)
  const defaultTask: ProjectTask = {
    id: 5,
    project_name: 'College Event Management System',
    description: 'An integrated university campus portal for publishing campus events, registering student attendees, sending automated reminder notifications, and viewing admin analytics.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    features: [
      'Event creation and publishing',
      'Student registration and ticket generation',
      'Event notifications and updates',
      'Admin dashboard with RSVP analytics'
    ],
    installation: 'npm install',
    run_command: 'npm run dev',
    environment_variables: ['MONGO_URI'],
    project_structure: '',
    api_info: '',
    license: 'MIT',
    has_missing_info: true
  };

  const [formData, setFormData] = useState<ProjectTask>(defaultTask);
  const [techInput, setTechInput] = useState(defaultTask.technologies.join(', '));
  const [featuresInput, setFeaturesInput] = useState(defaultTask.features.join('\n'));
  const [envInput, setEnvInput] = useState(defaultTask.environment_variables?.join(', ') || '');
  const [skillVersion, setSkillVersion] = useState<'v3' | 'v2' | 'v1'>('v3');

  // Input Mode: 'form' vs 'freeform'
  const [inputMode, setInputMode] = useState<'form' | 'freeform'>('form');
  const [freeformText, setFreeformText] = useState<string>(
    `Project: College Event Management System
Description: An integrated university campus portal for publishing campus events, registering student attendees, sending automated reminder notifications, and viewing admin analytics.
Technologies: React, Node.js, MongoDB
Features:
- Event creation and publishing
- Student registration and ticket generation
- Event notifications and updates
- Admin dashboard with RSVP analytics
Installation: npm install
Run Command: npm run dev
Environment Variables: MONGO_URI
License: MIT`
  );

  // Active View Tab: 'input' (User Information) | 'comparison' | 'skill' | 'baseline'
  const [activeTab, setActiveTab] = useState<'input' | 'comparison' | 'skill' | 'baseline'>('input');

  // Generation state
  const [baselineResult, setBaselineResult] = useState<GenerationResponse | null>(null);
  const [skillResult, setSkillResult] = useState<GenerationResponse | null>(null);
  const [loadingBaseline, setLoadingBaseline] = useState(false);
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to get active AI options
  const getAiOptions = () => {
    const apiKey = localStorage.getItem('gemma_api_key') || undefined;
    const model = localStorage.getItem('gemma_model') || 'gemini-1.5-flash-latest';
    const provider = localStorage.getItem('gemma_provider') || 'google';
    const baseUrl = localStorage.getItem('gemma_base_url') || undefined;
    return {
      apiKey,
      model,
      provider,
      baseUrl,
      freeformPrompt: inputMode === 'freeform' ? freeformText : undefined
    };
  };

  // Sync inputs
  const handleTechChange = (val: string) => {
    setTechInput(val);
    setFormData(prev => ({
      ...prev,
      technologies: val.split(',').map(s => s.trim()).filter(Boolean)
    }));
  };

  const handleFeaturesChange = (val: string) => {
    setFeaturesInput(val);
    setFormData(prev => ({
      ...prev,
      features: val.split('\n').map(s => s.trim()).filter(Boolean)
    }));
  };

  const handleEnvChange = (val: string) => {
    setEnvInput(val);
    setFormData(prev => ({
      ...prev,
      environment_variables: val.split(',').map(s => s.trim()).filter(Boolean)
    }));
  };

  // Presets
  const loadPreset = (presetName: string) => {
    setInputMode('form');
    if (presetName === 'college') {
      setFormData(defaultTask);
      setTechInput(defaultTask.technologies.join(', '));
      setFeaturesInput(defaultTask.features.join('\n'));
      setEnvInput(defaultTask.environment_variables?.join(', ') || '');
    } else if (presetName === 'weather') {
      const weatherTask: ProjectTask = {
        id: 3,
        project_name: 'Weather Application',
        description: 'A client-side responsive application that retrieves live meteorological forecasts and 5-day weather trends by city.',
        technologies: ['Vue.js', 'Vite', 'OpenWeatherMap API'],
        features: [
          'Real-time temperature and wind speed lookup',
          'Interactive 5-day forecast charts'
        ],
        installation: 'npm install',
        run_command: '',
        environment_variables: ['VITE_WEATHER_API_KEY'],
        project_structure: '',
        api_info: 'GET https://api.openweathermap.org/data/2.5/weather',
        license: '',
        has_missing_info: true
      };
      setFormData(weatherTask);
      setTechInput(weatherTask.technologies.join(', '));
      setFeaturesInput(weatherTask.features.join('\n'));
      setEnvInput(weatherTask.environment_variables?.join(', ') || '');
    } else if (presetName === 'todo') {
      const todoTask: ProjectTask = {
        id: 7,
        project_name: 'To-Do Application',
        description: 'A dead-simple single-file CLI to-do utility that saves tasks in a local text file.',
        technologies: ['Python'],
        features: ['Add task', 'List tasks', 'Mark task done'],
        installation: 'No installation required. Standard Python standard library only.',
        run_command: 'python todo.py list',
        environment_variables: [],
        project_structure: 'todo.py',
        api_info: '',
        license: 'MIT',
        has_missing_info: true
      };
      setFormData(todoTask);
      setTechInput(todoTask.technologies.join(', '));
      setFeaturesInput(todoTask.features.join('\n'));
      setEnvInput('');
    }
  };

  // Generation Handlers
  const handleGenerateBaseline = async () => {
    setLoadingBaseline(true);
    setErrorMsg(null);
    try {
      const options = getAiOptions();
      const res = await generateBaseline(formData, options);
      setBaselineResult(res);
      setActiveTab('baseline');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate baseline README');
    } finally {
      setLoadingBaseline(false);
    }
  };

  const handleGenerateSkill = async () => {
    setLoadingSkill(true);
    setErrorMsg(null);
    try {
      const options = getAiOptions();
      const res = await generateSkill(formData, skillVersion, options);
      setSkillResult(res);
      setActiveTab('skill');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate skilled README');
    } finally {
      setLoadingSkill(false);
    }
  };

  const handleGenerateBoth = async () => {
    setLoadingBaseline(true);
    setLoadingSkill(true);
    setErrorMsg(null);
    try {
      const options = getAiOptions();
      const [bRes, sRes] = await Promise.all([
        generateBaseline(formData, options),
        generateSkill(formData, skillVersion, options)
      ]);
      setBaselineResult(bRes);
      setSkillResult(sRes);
      setActiveTab('comparison');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate comparison');
    } finally {
      setLoadingBaseline(false);
      setLoadingSkill(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>README Generator & Benchmark Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                Gemma 4
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your project information, generate outputs with or without the skill, and compare scores.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-mono">Quick Load:</span>
            <button
              onClick={() => loadPreset('college')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-all shadow-sm"
            >
              ★ College Event (Demo)
            </button>
            <button
              onClick={() => loadPreset('weather')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              Weather App (Incomplete)
            </button>
            <button
              onClick={() => loadPreset('todo')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              To-Do CLI (Regression)
            </button>
          </div>
        </div>

        {/* Primary View Switcher Tabs (Requested Separate Tab for User Information) */}
        <div className="flex items-center justify-between gap-4 mt-5 flex-wrap">
          <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs shadow-md">
            {/* Tab 1: User Information */}
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'input'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. User Information (Project Spec)</span>
              {formData.project_name && (
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
              )}
            </button>

            {/* Tab 2: Dual Comparison */}
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Dual Comparison (Side-by-Side)</span>
              {baselineResult && skillResult && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                  Ready
                </span>
              )}
            </button>

            {/* Tab 3: With Skill Only */}
            <button
              onClick={() => setActiveTab('skill')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'skill'
                  ? 'bg-slate-800 text-emerald-300 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. With Skill {skillResult?.evaluation ? `(${skillResult.evaluation.totalScore}/100)` : ''}</span>
            </button>

            {/* Tab 4: Without Skill Only */}
            <button
              onClick={() => setActiveTab('baseline')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'baseline'
                  ? 'bg-slate-800 text-slate-200 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-slate-400" />
              <span>4. Raw Baseline {baselineResult?.evaluation ? `(${baselineResult.evaluation.totalScore}/100)` : ''}</span>
            </button>
          </div>

          {/* Quick Score Delta if both generated */}
          {baselineResult?.evaluation && skillResult?.evaluation && (
            <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Baseline: <strong>{baselineResult.evaluation.totalScore}</strong></span>
              <span className="text-slate-600">→</span>
              <span className="text-emerald-400 font-bold">Skill: <strong>{skillResult.evaluation.totalScore}</strong></span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                skillResult.evaluation.totalScore >= baselineResult.evaluation.totalScore
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {skillResult.evaluation.totalScore >= baselineResult.evaluation.totalScore ? '+' : ''}
                {skillResult.evaluation.totalScore - baselineResult.evaluation.totalScore} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: DEDICATED USER INFORMATION (PROJECT SPECIFICATION) VIEW */}
      {/* ============================================================== */}
      {activeTab === 'input' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Form Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>User Information & Project Specification</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Fill in your project parameters below, or switch to natural language to paste your description.
                </p>
              </div>

              {/* Mode Toggle: Form vs Freeform */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('form')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    inputMode === 'form'
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Structured Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('freeform')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    inputMode === 'freeform'
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Natural Language Prompt</span>
                </button>
              </div>
            </div>

            {/* Natural Language Freeform Mode */}
            {inputMode === 'freeform' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                    Type or Paste Any Project Description in Plain English:
                  </label>
                  <textarea
                    rows={12}
                    value={freeformText}
                    onChange={e => setFreeformText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 text-xs leading-relaxed font-mono"
                    placeholder="Enter project name, technologies, commands, and features in natural language..."
                  />
                </div>
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                  <span className="text-emerald-400 font-bold">✨ Tip: </span>
                  Gemma 4 will extract the technologies, commands, and features automatically and structure the README.
                </div>
              </div>
            ) : (
              /* Structured Multi-Field Form */
              <div className="space-y-6 text-xs">
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    1. Project Identity
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-slate-300 font-medium mb-1">Project Name *</label>
                      <input
                        type="text"
                        value={formData.project_name}
                        onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. College Event Management System"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 font-medium mb-1">Project Description *</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Concise overview of application domain and purpose"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Tech Stack & Features */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                    2. Tech Stack & Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Technologies (comma-separated)</label>
                      <input
                        type="text"
                        value={techInput}
                        onChange={e => handleTechChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">E.g., React, Express, MongoDB, Tailwind CSS</p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Core Features (one per line)</label>
                      <textarea
                        rows={3}
                        value={featuresInput}
                        onChange={e => handleFeaturesChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-sans"
                        placeholder="Event creation and publishing&#10;Student registration&#10;Admin dashboard"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Commands & Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    3. Commands & Configuration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Installation Command</label>
                      <input
                        type="text"
                        value={formData.installation || ''}
                        onChange={e => setFormData({ ...formData, installation: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="npm install"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Run / Start Command</label>
                      <input
                        type="text"
                        value={formData.run_command || ''}
                        onChange={e => setFormData({ ...formData, run_command: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="npm run dev"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Environment Variables</label>
                      <input
                        type="text"
                        value={envInput}
                        onChange={e => handleEnvChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="MONGO_URI, JWT_SECRET"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Specifications */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                    4. Licensing & Architecture (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">License</label>
                      <input
                        type="text"
                        value={formData.license || ''}
                        onChange={e => setFormData({ ...formData, license: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="MIT, Apache-2.0, or blank"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Project Structure</label>
                      <input
                        type="text"
                        value={formData.project_structure || ''}
                        onChange={e => setFormData({ ...formData, project_structure: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-[11px]"
                        placeholder="src/, controllers/, server.js"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">API Routes</label>
                      <input
                        type="text"
                        value={formData.api_info || ''}
                        onChange={e => setFormData({ ...formData, api_info: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-[11px]"
                        placeholder="POST /api/events"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Version Selection */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Skill Directive for Mode B:</span>
                <span className="text-[11px] text-slate-500">Select which version of README_SKILL to evaluate against baseline</span>
              </div>
              <div className="flex items-center gap-2">
                {(['v3', 'v2', 'v1'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSkillVersion(v)}
                    className={`py-1.5 px-3 rounded-lg font-mono text-xs border transition-all ${
                      skillVersion === v
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {v.toUpperCase()} {v === 'v3' ? '(Production)' : v === 'v2' ? '(Structured)' : '(Basic)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons to Trigger Generation */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerateBoth}
                disabled={loadingBaseline || loadingSkill}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
              >
                {loadingBaseline || loadingSkill ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Gemma 4 Comparison...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Generate Both & Compare (Recommended)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleGenerateSkill}
                  disabled={loadingSkill}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 font-semibold rounded-xl text-xs border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generate With Skill</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateBaseline}
                  disabled={loadingBaseline}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                  <span>Generate Raw Baseline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FULL-WIDTH DUAL COMPARISON VIEW (SIDE-BY-SIDE)           */}
      {/* ============================================================== */}
      {activeTab === 'comparison' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('input')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Edit User Information (Project Spec)</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                Active Project: <strong className="text-white">{formData.project_name || 'My Project'}</strong>
              </span>

              <button
                onClick={handleGenerateBoth}
                disabled={loadingBaseline || loadingSkill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBaseline || loadingSkill ? 'animate-spin' : ''}`} />
                <span>Re-Generate Both</span>
              </button>
            </div>
          </div>

          {!baselineResult && !skillResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">No Comparison Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click the button below to generate both Mode A (Without Skill) and Mode B (With Skill) using your user information.
              </p>
              <button
                onClick={handleGenerateBoth}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30"
              >
                Generate Both Outputs Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Mode A (Raw Baseline) */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="font-bold text-sm text-slate-200">Mode A: Raw Baseline (No Skill)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {baselineResult?.evaluation ? `${baselineResult.evaluation.totalScore}/100` : ''}
                  </span>
                </div>

                {/* Fixed-height Markdown Viewer Container */}
                <div className="h-[480px] rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  <MarkdownViewer
                    content={baselineResult?.markdown || '# Click "Re-Generate Both" to run Baseline'}
                    title="baseline_README.md"
                    modeLabel={baselineResult?.modelUsed || 'Baseline'}
                    score={baselineResult?.evaluation?.totalScore}
                  />
                </div>

                {/* Scorecard */}
                {baselineResult?.evaluation && (
                  <ScoreCard
                    evaluation={baselineResult.evaluation}
                    title="Baseline Rubric Score"
                    badge="Mode A (Raw LLM)"
                  />
                )}
              </div>

              {/* Right Column: Mode B (With README Skill) */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between bg-emerald-950/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-sm text-emerald-300">Mode B: Guided by README_SKILL.md</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {skillResult?.evaluation ? `${skillResult.evaluation.totalScore}/100` : ''}
                  </span>
                </div>

                {/* Fixed-height Markdown Viewer Container */}
                <div className="h-[480px] rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  <MarkdownViewer
                    content={skillResult?.markdown || '# Click "Re-Generate Both" to run Skill'}
                    title="skilled_README.md"
                    modeLabel={skillResult?.modelUsed || `README_SKILL (${skillVersion.toUpperCase()})`}
                    score={skillResult?.evaluation?.totalScore}
                  />
                </div>

                {/* Scorecard */}
                {skillResult?.evaluation && (
                  <ScoreCard
                    evaluation={skillResult.evaluation}
                    title="Skill Rubric Score"
                    badge={`Mode B (${skillVersion.toUpperCase()})`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SINGLE VIEW - WITH SKILL                                */}
      {/* ============================================================== */}
      {activeTab === 'skill' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('input')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Edit User Information</span>
            </button>

            <button
              onClick={handleGenerateSkill}
              disabled={loadingSkill}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSkill ? 'animate-spin' : ''}`} />
              <span>Re-Generate With Skill</span>
            </button>
          </div>

          {skillResult ? (
            <div className="space-y-6">
              <div className="h-[560px] rounded-xl overflow-hidden shadow-xl border border-slate-800">
                <MarkdownViewer
                  content={skillResult.markdown}
                  title="skilled_README.md"
                  modeLabel={skillResult.modelUsed}
                  score={skillResult.evaluation?.totalScore}
                />
              </div>

              {skillResult.evaluation && (
                <ScoreCard evaluation={skillResult.evaluation} title="Gemma Skill Rubric Audit" />
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Skilled Output Not Generated</h4>
              <button
                onClick={handleGenerateSkill}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Generate With Skill Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SINGLE VIEW - WITHOUT SKILL                             */}
      {/* ============================================================== */}
      {activeTab === 'baseline' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('input')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Edit User Information</span>
            </button>

            <button
              onClick={handleGenerateBaseline}
              disabled={loadingBaseline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBaseline ? 'animate-spin' : ''}`} />
              <span>Re-Generate Baseline</span>
            </button>
          </div>

          {baselineResult ? (
            <div className="space-y-6">
              <div className="h-[560px] rounded-xl overflow-hidden shadow-xl border border-slate-800">
                <MarkdownViewer
                  content={baselineResult.markdown}
                  title="baseline_README.md"
                  modeLabel={baselineResult.modelUsed}
                  score={baselineResult.evaluation?.totalScore}
                />
              </div>

              {baselineResult.evaluation && (
                <ScoreCard evaluation={baselineResult.evaluation} title="Raw Baseline Rubric Audit" />
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <Bot className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Baseline Output Not Generated</h4>
              <button
                onClick={handleGenerateBaseline}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                Generate Baseline Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
