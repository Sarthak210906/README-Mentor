import React from 'react';

interface CategoryAverage {
  name: string;
  max: number;
  baseline_avg: number;
  skill_avg: number;
  delta_avg: number;
}

interface CategoryChartProps {
  categories: {
    [key: string]: CategoryAverage;
  };
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
  const catEntries = Object.entries(categories);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="font-semibold text-white text-base">Category Performance Comparison</h4>
          <p className="text-xs text-slate-400">Baseline AI (without skill) vs Skilled AI (with README_SKILL.md)</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-600"></span>
            <span className="text-slate-300">Baseline (No Skill)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-emerald-300">With Skill</span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5 pt-2">
        {catEntries.map(([key, cat]) => {
          const baselinePct = Math.round((cat.baseline_avg / cat.max) * 100);
          const skillPct = Math.round((cat.skill_avg / cat.max) * 100);
          const isPositive = cat.delta_avg > 0;
          const isNegative = cat.delta_avg < 0;

          return (
            <div key={key} className="space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-medium">{cat.name} <span className="text-slate-500 font-mono text-[11px]">({cat.max} pts)</span></span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">{cat.baseline_avg}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-emerald-400 font-bold">{cat.skill_avg}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400' :
                    isNegative ? 'bg-rose-500/10 text-rose-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {isPositive ? `+${cat.delta_avg}` : cat.delta_avg}
                  </span>
                </div>
              </div>

              {/* Dual Bar Comparison */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* Baseline bar */}
                <div className="bg-slate-800/80 h-2.5 rounded-full overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-slate-500 transition-all duration-500 rounded-full"
                    style={{ width: `${baselinePct}%` }}
                    title={`Baseline: ${cat.baseline_avg} (${baselinePct}%)`}
                  ></div>
                </div>

                {/* Skill bar */}
                <div className="bg-slate-800/80 h-2.5 rounded-full overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full shadow-sm shadow-emerald-500/50"
                    style={{ width: `${skillPct}%` }}
                    title={`Skill: ${cat.skill_avg} (${skillPct}%)`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
