import React from 'react';
import { Sparkles, ShieldCheck, BarChart2, ArrowRight, CheckCircle2, AlertOctagon, FileCheck, Layers, GitFork, Terminal } from 'lucide-react';
import { WorkflowBanner } from '../components/WorkflowBanner';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hackathon Requirement Callout */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base">
              README Mentor is not just an AI README generator.
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              It is an <strong className="text-emerald-400">experimentally evaluated Agent Skill</strong> that proves where AI prompts help, where they fail, and where they regress.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('evaluate')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all ml-auto sm:ml-0"
        >
          <span>View Benchmark Findings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Google DeepMind Hackathon Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          README <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Mentor</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          Build better README files. <span className="text-white font-semibold underline decoration-emerald-500/50 underline-offset-4">Measure whether the AI skill actually helps.</span>
        </p>

        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Agent Skills are shared everywhere, but rarely benchmarked. README Mentor provides a reusable skill, a 10-task evaluation set, and an algorithmic 100-point rubric.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <button
            onClick={() => onNavigate('generate')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try README Generator</span>
          </button>
          <button
            onClick={() => onNavigate('evaluate')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 flex items-center gap-2 transition-all hover:border-slate-500"
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Run Evaluation Suite</span>
          </button>
        </div>
      </div>

      {/* 3 Core Interactive Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Generate */}
        <div 
          onClick={() => onNavigate('generate')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            <span>Generate</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Create a README using AI. Compare outputs side-by-side with and without the Agent Skill using preloaded demo projects.
          </p>
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span>Preloaded: College Event System</span>
          </div>
        </div>

        {/* Card 2: Skill */}
        <div 
          onClick={() => onNavigate('skill')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            <span>Skill</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Inspect the reusable Agent Skill stored in <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded text-xs">skills/README_SKILL.md</code> and explore its anti-hallucination rules.
          </p>
          <div className="text-xs font-mono text-blue-400 flex items-center gap-1.5">
            <span>Zero-Fabrication Directives</span>
          </div>
        </div>

        {/* Card 3: Evaluate */}
        <div 
          onClick={() => onNavigate('evaluate')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            <span>Evaluate</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Compare AI performance with and without the skill across 10 benchmark projects. Track positive, neutral, and negative outcomes.
          </p>
          <div className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
            <span>10 Tasks • 100-Point Rubric</span>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <WorkflowBanner />

      {/* The Core Hackathon Problem Statement */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Why Test Agent Skills Systematically?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Most developers assume adding a markdown skill or system prompt always improves output. In reality, agent skills can introduce rigid boilerplate, over-engineer simple utilities, or silently hallucinate missing configuration when attempting to fill every templated section.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
              <strong className="block text-white mb-1">Where it helps</strong>
              Complex repos, missing env var warnings, prerequisite checks (+12 to +24 pts).
            </div>
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300">
              <strong className="block text-white mb-1">Where it's neutral</strong>
              Already exhaustive specifications where raw LLMs score &gt;95 pts.
            </div>
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300">
              <strong className="block text-white mb-1">Where it regresses</strong>
              Micro-scripts burdened with excessive enterprise boilerplate (-2.5 pts).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
