import React, { useState } from 'react';
import { EvaluationResult } from '../types';
import { CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface ScoreCardProps {
  evaluation: EvaluationResult;
  title?: string;
  badge?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ evaluation, title = 'Evaluation Scorecard', badge }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const categories = Object.entries(evaluation.categoryScores);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white text-base">{title}</h4>
            {badge && (
              <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-800 border border-slate-700 text-slate-300">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">10-Category Standard Rubric (100 pts max)</p>
        </div>

        {/* Big Score Badge */}
        <div className={`px-4 py-2 rounded-xl border flex items-baseline gap-1 ${getScoreColor(evaluation.totalScore)}`}>
          <span className="text-2xl font-black font-mono">{evaluation.totalScore}</span>
          <span className="text-xs font-mono opacity-80">/100</span>
        </div>
      </div>

      {/* Progress Bars for Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {categories.map(([key, cat]) => {
          const pct = Math.round((cat.score / cat.max) * 100);
          return (
            <div key={key} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 capitalize font-medium">{key.replace('_', ' ')}</span>
                <span className="font-mono text-slate-400">
                  <span className="text-white font-semibold">{cat.score}</span>/{cat.max}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct === 100 ? 'bg-emerald-400' : pct >= 70 ? 'bg-blue-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle Itemized Feedback */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Inspect Itemized Audit Feedback ({evaluation.summaryFeedback.length} checks)
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <ul className="mt-3 space-y-1.5 text-xs text-slate-300 max-h-48 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
            {evaluation.summaryFeedback.map((item, idx) => {
              const isNegative = item.includes('(-') || item.includes('Penalty') || item.includes('(0)');
              return (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`text-[10px] mt-0.5 ${isNegative ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isNegative ? '▲' : '✓'}
                  </span>
                  <span className={isNegative ? 'text-amber-300' : 'text-slate-300'}>{item}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
