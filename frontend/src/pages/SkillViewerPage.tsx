import React, { useState, useEffect } from 'react';
import { fetchSkill, fetchRules } from '../api';
import { RuleDefinition } from '../types';
import { ShieldCheck, CheckCircle2, AlertOctagon, Terminal, FileCode, ArrowDown, Copy, Check, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const SkillViewerPage: React.FC = () => {
  const [version, setVersion] = useState<'v3' | 'v2' | 'v1'>('v3');
  const [skillContent, setSkillContent] = useState<string>('');
  const [rules, setRules] = useState<RuleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData(version);
  }, [version]);

  const loadData = async (ver: string) => {
    setLoading(true);
    try {
      const [skillData, rulesData] = await Promise.all([
        fetchSkill(ver),
        fetchRules()
      ]);
      setSkillContent(skillData.content);
      setRules(rulesData.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySkill = () => {
    navigator.clipboard.writeText(skillContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Agent Skill Architecture</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Reusable Directive
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Examine the actual skill file stored in <code className="text-slate-300 font-mono text-xs">skills/README_SKILL.md</code>.
          </p>
        </div>

        {/* Version Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Skill Version:</span>
          {(['v3', 'v2', 'v1'] as const).map(v => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                version === v
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {v.toUpperCase()} {v === 'v3' ? '(Production)' : v === 'v2' ? '(Structured)' : '(Basic)'}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Workflow Diagram */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 text-center font-mono">
          Skill Enforcement Flowchart
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          {/* Node 1 */}
          <div className="w-full md:w-48 bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold text-xs">
              SKILL
            </div>
            <div className="font-bold text-white text-sm">README Skill</div>
            <div className="text-[11px] text-slate-400 mt-0.5">skills/README_SKILL.md</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-500 md:hidden" />
          <div className="hidden md:block text-slate-500 font-bold">→</div>

          {/* Node 2 */}
          <div className="w-full md:w-48 bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold text-xs">
              RULES
            </div>
            <div className="font-bold text-white text-sm">System Directives</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Safety & Completeness</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-500 md:hidden" />
          <div className="hidden md:block text-slate-500 font-bold">→</div>

          {/* Node 3 */}
          <div className="w-full md:w-48 bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold text-xs">
              AGENT
            </div>
            <div className="font-bold text-white text-sm">AI Agent</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Gemma 4 Guided Pipeline</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-500 md:hidden" />
          <div className="hidden md:block text-slate-500 font-bold">→</div>

          {/* Node 4 */}
          <div className="w-full md:w-48 bg-slate-800/80 border border-emerald-500/40 rounded-xl p-4 text-center bg-emerald-950/20">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 font-mono font-bold text-xs">
              DOC
            </div>
            <div className="font-bold text-emerald-300 text-sm">Consistent README</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">Production Standard</div>
          </div>
        </div>
      </div>

      {/* Core Rules Cards Section (Requirement 18) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Core Agent Skill Rules & Directives
          </h3>
          <span className="text-xs text-slate-400 font-mono">Enforced across all generation passes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <span>RULE-01</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px]">CRITICAL</span>
            </div>
            <h4 className="font-bold text-white text-sm">Complete Required Sections</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guarantees Title (H1), About/Overview, Features, Tech Stack, Prerequisites, Installation, Usage, Config, Contributing, and License.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold">
              <span>RULE-02</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 text-[10px]">CRITICAL</span>
            </div>
            <h4 className="font-bold text-white text-sm">Zero Fabrication (Anti-Hallucination)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never invent database passwords, API keys, credentials, nonexistent routes, or fake licenses. Mark unknown values explicitly.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold">
              <span>RULE-03</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 text-[10px]">HIGH</span>
            </div>
            <h4 className="font-bold text-white text-sm">Use Project-Specific Details</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every section must be anchored in the declared tech stack (e.g. Node for React, Python LTS for FastAPI) without generic placeholders.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <span>RULE-04</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px]">HIGH</span>
            </div>
            <h4 className="font-bold text-white text-sm">Strict Markdown Fencing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All shell commands and execution scripts must be enclosed in fenced code blocks with language specifiers (<code className="text-amber-300">bash</code>, <code className="text-amber-300">python</code>).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold">
              <span>RULE-05</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[10px]">MEDIUM</span>
            </div>
            <h4 className="font-bold text-white text-sm">Explicit Missing Info Callouts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When parameters are omitted, explicitly state their absence using note blocks (<code className="text-purple-300">&gt; [!NOTE]</code>) rather than silent fabrication.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-bold">
              <span>RULE-06</span>
              <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 text-[10px]">HIGH</span>
            </div>
            <h4 className="font-bold text-white text-sm">Pre-Flight Completeness Check</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Before finalizing generation, the agent silently checks off the required rubric categories to prevent truncation or missing sections.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Skill Markdown File Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">
              skills/{version === 'v3' ? 'README_SKILL.md' : version === 'v2' ? 'README_SKILL_V2.md' : 'README_SKILL_V1.md'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {version === 'v3' ? 'Version 3.0.0 (Full)' : version === 'v2' ? 'Version 2.0.0' : 'Version 1.0.0'}
            </span>
          </div>

          <button
            onClick={handleCopySkill}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-all font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Skill</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-slate-500 font-mono text-xs py-8 text-center">Loading skill...</div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs leading-relaxed prose-headings:text-white prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-code:text-emerald-300 prose-pre:bg-slate-950 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-950/20">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {skillContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
