import React from 'react';
import { BookOpen, Sparkles, BarChart2, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isDemoMode: boolean;
  modelName: string;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, isDemoMode, modelName, onOpenConfig }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'generate', label: 'README Generator', icon: Sparkles },
    { id: 'skill', label: 'Skill Viewer', icon: ShieldCheck },
    { id: 'evaluate', label: 'Evaluation Suite', icon: BarChart2 },
    { id: 'findings', label: 'Skill Impact', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">README Mentor</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Agent Skill + Eval
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">Empirical Skill Validation Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Runtime Mode Badge & Model Config Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConfig}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all hover:scale-105 ${
              isDemoMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Configure Gemma 4 API Key & Endpoint"
          >
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="font-semibold">{isDemoMode ? 'Demo Mode' : modelName}</span>
            <span className="text-[10px] opacity-70 underline ml-0.5">⚙ Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
