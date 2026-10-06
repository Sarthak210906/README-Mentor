import React, { useState } from 'react';
import { TaskComparison } from '../types';
import { X, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';

interface TaskDetailModalProps {
  task: TaskComparison | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const [viewTab, setViewTab] = useState<'side-by-side' | 'baseline' | 'skill' | 'rubric'>('side-by-side');

  if (!task) return null;

  const resultColor = 
    task.result === 'improved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    task.result === 'worse' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 bg-slate-800 rounded-md text-slate-300 font-bold">
              Task #{task.task_id}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {task.project_name}
              </h3>
              {task.has_missing_info && (
                <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" /> Intentionally incomplete specification (tests anti-hallucination)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${resultColor}`}>
              <span className="uppercase">{task.result}</span>
              <span>({task.improvement > 0 ? `+${task.improvement}` : task.improvement} pts)</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('side-by-side')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewTab === 'side-by-side' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setViewTab('baseline')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewTab === 'baseline' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Baseline Only ({task.baseline_score}/100)
            </button>
            <button
              onClick={() => setViewTab('skill')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewTab === 'skill' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              With Skill Only ({task.skill_score}/100)
            </button>
            <button
              onClick={() => setViewTab('rubric')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewTab === 'rubric' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Category Breakdown
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>Baseline: <strong className="text-slate-200">{task.baseline_score}</strong></span>
            <span>→</span>
            <span>With Skill: <strong className="text-emerald-400">{task.skill_score}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/30">
          {viewTab === 'side-by-side' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[65vh]">
              <div className="h-full flex flex-col">
                <MarkdownViewer
                  content={task.baseline_output}
                  title={`Baseline Output (No Skill)`}
                  modeLabel="Raw LLM Habits"
                  score={task.baseline_score}
                />
              </div>
              <div className="h-full flex flex-col">
                <MarkdownViewer
                  content={task.skill_output}
                  title={`Skilled Output (README_SKILL.md)`}
                  modeLabel="Production Skill Directive"
                  score={task.skill_score}
                />
              </div>
            </div>
          )}

          {viewTab === 'baseline' && (
            <div className="h-[65vh]">
              <MarkdownViewer
                content={task.baseline_output}
                title={`Baseline Output (Without Skill)`}
                modeLabel="Mode A: Raw LLM"
                score={task.baseline_score}
              />
            </div>
          )}

          {viewTab === 'skill' && (
            <div className="h-[65vh]">
              <MarkdownViewer
                content={task.skill_output}
                title={`Skilled Output (With README_SKILL.md)`}
                modeLabel="Mode B: Systematic Agent Skill"
                score={task.skill_score}
              />
            </div>
          )}

          {viewTab === 'rubric' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(task.category_scores).map(([key, cat]) => (
                  <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white capitalize text-sm">{key.replace('_', ' ')}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        cat.delta > 0 ? 'bg-emerald-500/10 text-emerald-400' :
                        cat.delta < 0 ? 'bg-rose-500/10 text-rose-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {cat.delta > 0 ? `+${cat.delta}` : cat.delta} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>Baseline: <strong className="text-slate-200">{cat.baseline}/{cat.max}</strong></span>
                      <span>Skill: <strong className="text-emerald-400">{cat.skill}/{cat.max}</strong></span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-slate-500 h-full" style={{ width: `${(cat.baseline / cat.max) * 50}%` }} title="Baseline"></div>
                      <div className="bg-emerald-500 h-full ml-auto" style={{ width: `${(cat.skill / cat.max) * 50}%` }} title="Skill"></div>
                    </div>
                  </div>
                ))}
              </div>

              {task.notes && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400 font-mono">Dataset Design Notes: </span>
                  {task.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
