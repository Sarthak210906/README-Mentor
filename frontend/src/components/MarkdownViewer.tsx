import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Eye, Code, FileText } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  title?: string;
  modeLabel?: string;
  score?: number;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  title = 'README.md',
  modeLabel,
  score
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Header bar */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-medium text-slate-300">{title}</span>
          {modeLabel && (
            <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-800 border border-slate-700 text-slate-300">
              {modeLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {score !== undefined && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
              score >= 90 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
              score >= 75 ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
              'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              Score: {score}/100
            </span>
          )}

          {/* Tab switcher */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-slate-700 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'raw'
                  ? 'bg-slate-700 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs rounded-lg border border-slate-700/80 transition-all font-medium"
            title="Copy Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 text-slate-200">
        {activeTab === 'preview' ? (
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-slate-800 prose-h1:pb-2 prose-h2:text-lg prose-h2:font-semibold prose-h2:border-b prose-h2:border-slate-800/60 prose-h2:pb-1 prose-h2:mt-6 prose-h3:text-sm prose-h3:font-semibold prose-p:text-slate-300 prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:text-slate-300 prose-code:text-emerald-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-lg prose-table:border prose-table:border-slate-800 prose-th:border prose-th:border-slate-800 prose-th:bg-slate-800/50 prose-th:p-2 prose-th:text-xs prose-td:border prose-td:border-slate-800 prose-td:p-2 prose-td:text-xs prose-blockquote:border-l-4 prose-blockquote:border-emerald-500/50 prose-blockquote:bg-emerald-950/20 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r prose-blockquote:text-slate-300 prose-blockquote:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '_No markdown content available._'}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap select-all leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
            {content || '# Empty README'}
          </pre>
        )}
      </div>
    </div>
  );
};
