import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { GeneratorPage } from './pages/GeneratorPage';
import { SkillViewerPage } from './pages/SkillViewerPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { FindingsPage } from './pages/FindingsPage';
import { GemmaConfigModal } from './components/GemmaConfigModal';
import { fetchStatus } from './api';
import { Terminal, Shield, Sparkles, ExternalLink, GitBranch } from 'lucide-react';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [modelName, setModelName] = useState<string>('Gemma 4 (Demo Mode)');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const refreshStatus = () => {
    fetchStatus()
      .then(res => {
        setIsDemoMode(res.isDemoMode);
        setModelName(res.modelName);
      })
      .catch(() => {
        setIsDemoMode(true);
        setModelName('Gemma 4 (Demo Mode)');
      });
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleConfigSaved = (config: any) => {
    refreshStatus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isDemoMode={isDemoMode}
        modelName={modelName}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Gemma Model Config Modal */}
      <GemmaConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={handleConfigSaved}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'generate' && <GeneratorPage />}
        {currentPage === 'skill' && <SkillViewerPage />}
        {currentPage === 'evaluate' && <EvaluationPage />}
        {currentPage === 'findings' && <FindingsPage />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              M
            </div>
            <div>
              <span className="font-bold text-white">README Mentor</span>
              <span className="text-slate-500 ml-2 font-mono">v1.0.0 • Hackathon Prototype</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-400">
            <span>Skill: <strong className="text-emerald-400">skills/README_SKILL.md</strong></span>
            <span>Rubric: <strong className="text-blue-400">100 Pts (10 Dimensions)</strong></span>
            <span>Dataset: <strong className="text-purple-400">10 Empirical Tasks</strong></span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Solo Hackathon Build</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
