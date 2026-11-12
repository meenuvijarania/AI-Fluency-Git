import { Activity, Plus, Moon, Sun, Settings } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'goals' | 'workouts' | 'analytics' | 'milestones';
  onSelectTab: (tab: 'dashboard' | 'goals' | 'workouts' | 'analytics' | 'milestones') => void;
  onOpenQuickLog: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({
  currentTab,
  onSelectTab,
  onOpenQuickLog,
  onOpenSettings,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'goals', label: 'Goals' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'milestones', label: 'Milestones' },
  ] as const;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display whitespace-nowrap shrink-0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            PULSE
          </span>
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              currentTab === item.id
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
            }`}
          >
            {item.label}
            {currentTab === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action + utility buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings & Data Backup"
          aria-label="Settings"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Log</span>
        </button>
      </div>
    </header>
  );
}
