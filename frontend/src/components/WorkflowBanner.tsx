import React from 'react';
import { FileCode, Bot, Scale, BarChart3, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const WorkflowBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
          Core Experimental Pipeline
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mt-3">
          Empirical Validation Architecture
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          How README Mentor systematically tests whether an Agent Skill actually enhances AI output.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1: Input */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <FileCode className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Identical Project Spec</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Same project metadata (features, tech, commands, missing fields) supplied to both pipelines.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] font-mono text-slate-500">
            Fair evaluation baseline
          </div>
        </div>

        {/* Step 2: Dual Execution (Without vs With Skill) */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Dual AI Execution</h4>
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/60 px-2 py-1 rounded border border-slate-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Mode A: Baseline AI (Raw)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Mode B: With README Skill</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] font-mono text-slate-500">
            Direct A/B comparison
          </div>
        </div>

        {/* Step 3: Standardized Evaluator */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">100-Point Rubric Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algorithmic scoring across 10 categories: commands, env variables, anti-hallucination, and completeness.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] font-mono text-slate-500">
            Deterministic & transparent
          </div>
        </div>

        {/* Step 4: Empirical Findings */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-white text-sm mb-1">Impact & Regression Analysis</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Measures improved tasks, neutral tasks, and honest regressions (where skills over-engineer tiny tools).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] font-mono text-slate-500">
            No faked outcomes
          </div>
        </div>
      </div>
    </div>
  );
};
