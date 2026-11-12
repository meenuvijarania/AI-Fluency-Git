import { useState } from 'react';
import { Trophy, Award, Medal, Shield, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AchievementBadge } from '../types/fitness';

interface MilestonesViewProps {
  badges: AchievementBadge[];
}

export function MilestonesView({ badges }: MilestonesViewProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'in_progress') return !b.unlocked;
    if (filter !== 'all') return b.category === filter;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleTrophyClick = (badge: AchievementBadge) => {
    if (badge.unlocked) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Trophy Cabinet</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{unlockedCount} of {badges.length} Unlocked</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
            Milestones & Personal Records
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({badges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'unlocked'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'in_progress'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            In Progress ({badges.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              onClick={() => handleTrophyClick(badge)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                badge.unlocked
                  ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 shadow-xs hover:border-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    badge.unlocked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {badge.unlocked ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <Shield className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                      {badge.title}
                    </h3>
                    {badge.unlocked ? (
                      <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                        {badge.progress}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {badge.description}
                  </p>

                  {badge.unlocked && badge.unlockedDate ? (
                    <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Achieved {badge.unlockedDate}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-400 dark:bg-slate-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
