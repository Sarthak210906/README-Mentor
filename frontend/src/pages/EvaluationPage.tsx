import React, { useState, useEffect } from 'react';
import { fetchEvaluationResults, runEvaluation } from '../api';
import { FullEvaluationReport, TaskComparison } from '../types';
import { BarChart2, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown, Minus, Eye, Sparkles, Filter } from 'lucide-react';
import { CategoryChart } from '../components/CategoryChart';
import { TaskDetailModal } from '../components/TaskDetailModal';

export const EvaluationPage: React.FC = () => {
  const [report, setReport] = useState<FullEvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskComparison | null>(null);
  const [filterResult, setFilterResult] = useState<'all' | 'improved' | 'same' | 'worse'>('all');
  const [skillVersion, setSkillVersion] = useState<'v3' | 'v2' | 'v1'>('v3');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await fetchEvaluationResults();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const freshReport = await runEvaluation(skillVersion);
      setReport(freshReport);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const filteredTasks = report?.tasks.filter(t => {
    if (filterResult === 'all') return true;
    return t.result === filterResult;
  }) || [];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Evaluation Dashboard</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              Empirical A/B Suite
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Systematic benchmark across 10 software project tasks evaluated against the 100-point rubric.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <select
            value={skillVersion}
            onChange={e => setSkillVersion(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
          >
            <option value="v3">Skill V3 (Production)</option>
            <option value="v2">Skill V2 (Structured)</option>
            <option value="v1">Skill V1 (Basic)</option>
          </select>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Benchmarking 10 Tasks...' : 'Run Full Evaluation'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400 font-mono text-xs">
          Loading evaluation report...
        </div>
      ) : report ? (
        <>
          {/* Top Score Comparison Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
              {/* Baseline Average */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Without Skill (Baseline)
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-300 font-mono">
                    {report.average_baseline_score}
                  </span>
                  <span className="text-sm font-mono text-slate-500">/100</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  Raw AI Prompting
                </span>
              </div>

              {/* Net Delta Badge */}
              <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Net Skill Impact
                </span>
                <div className="px-5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                    +{report.average_improvement}
                  </span>
                  <span className="text-xs text-emerald-300 font-mono">pts</span>
                </div>
                <span className="text-xs text-slate-400 font-mono mt-2">
                  Average Lift across {report.total_tasks} Tasks
                </span>
              </div>

              {/* Skill Average */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                  With README Skill ({report.skill_version.toUpperCase()})
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
                    {report.average_skill_score}
                  </span>
                  <span className="text-sm font-mono text-emerald-400/70">/100</span>
                </div>
                <span className="text-[11px] text-emerald-400/80 font-mono mt-1 block">
                  Standardized Directive
                </span>
              </div>
            </div>
          </div>

          {/* Statistical Breakdown Cards (Requirement 21) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono">Improved Rate</span>
                <h4 className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                  {report.improvement_rate}%
                </h4>
                <p className="text-[11px] text-slate-500">{report.improved_count} out of {report.total_tasks} tasks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                ✓
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono">No Significant Change</span>
                <h4 className="text-2xl font-bold text-amber-400 font-mono mt-0.5">
                  {report.no_change_rate}%
                </h4>
                <p className="text-[11px] text-slate-500">{report.same_count} out of {report.total_tasks} tasks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                ~
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono">Regression Rate (Worse)</span>
                <h4 className="text-2xl font-bold text-rose-400 font-mono mt-0.5">
                  {report.regression_rate}%
                </h4>
                <p className="text-[11px] text-slate-500">{report.worse_count} out of {report.total_tasks} tasks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
                ▲
              </div>
            </div>
          </div>

          {/* Category Chart Section (Requirement 19) */}
          <CategoryChart categories={report.category_averages} />

          {/* Task-by-Task Table Section (Requirement 19) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-white text-base">Task-by-Task Benchmark Results</h3>
                <p className="text-xs text-slate-400">Click any row to inspect side-by-side README outputs and audit details.</p>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterResult('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterResult === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({report.total_tasks})
                </button>
                <button
                  onClick={() => setFilterResult('improved')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterResult === 'improved' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Improved ({report.improved_count})
                </button>
                <button
                  onClick={() => setFilterResult('same')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterResult === 'same' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Same ({report.same_count})
                </button>
                <button
                  onClick={() => setFilterResult('worse')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterResult === 'worse' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Worse ({report.worse_count})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Task / Project Name</th>
                    <th className="py-3 px-4 text-center">Incomplete Info?</th>
                    <th className="py-3 px-4 text-center">Without Skill</th>
                    <th className="py-3 px-4 text-center">With Skill</th>
                    <th className="py-3 px-4 text-center">Difference</th>
                    <th className="py-3 px-4 text-center">Result Status</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredTasks.map(t => {
                    const isImproved = t.result === 'improved';
                    const isWorse = t.result === 'worse';
                    return (
                      <tr
                        key={t.task_id}
                        onClick={() => setSelectedTask(t)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4 font-mono text-slate-500 font-semibold">{t.task_id}</td>
                        <td className="py-3 px-4 font-medium text-slate-200 group-hover:text-white">
                          <div className="flex items-center gap-2">
                            <span>{t.project_name}</span>
                            {t.task_id === 5 && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-mono">
                                Demo Project
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.has_missing_info ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Yes (Missing Info)
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono">Complete</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-300 font-bold">
                          {t.baseline_score}/100
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                          {t.skill_score}/100
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={
                            isImproved ? 'text-emerald-400' : isWorse ? 'text-rose-400' : 'text-slate-400'
                          }>
                            {t.improvement > 0 ? `+${t.improvement}` : t.improvement} pts
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            isImproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            isWorse ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {isImproved ? <TrendingUp className="w-3 h-3" /> : isWorse ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {t.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 group-hover:text-emerald-400 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400 font-mono text-xs">
          No evaluation data found. Click "Run Full Evaluation" above.
        </div>
      )}

      {/* Detail Inspection Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};
