import { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Edit3, Trash2, Calendar, TrendingUp, Filter, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FitnessGoal, GoalCategory, GoalStatus } from '../types/fitness';
import { calculateGoalProgress } from '../utils/storage';

interface GoalsViewProps {
  goals: FitnessGoal[];
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: FitnessGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateGoalProgress: (goalId: string, newValue: number, note?: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onToggleGoalStatus: (goalId: string, newStatus: GoalStatus) => void;
}

export function GoalsView({
  goals,
  onOpenCreateGoal,
  onEditGoal,
  onDeleteGoal,
  onUpdateGoalProgress,
  onToggleMilestone,
  onToggleGoalStatus,
}: GoalsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inlineUpdateGoalId, setInlineUpdateGoalId] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState<string>('');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'weight', label: 'Body Weight' },
    { id: 'strength', label: 'Strength PRs' },
    { id: 'endurance', label: 'Endurance & Cardio' },
    { id: 'body_metric', label: 'Body Composition' },
    { id: 'habit', label: 'Habits & Frequency' },
  ];

  const filteredGoals = goals.filter((g) => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && g.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        (g.notes && g.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleInlineSubmit = (goal: FitnessGoal) => {
    const val = parseFloat(inlineValue);
    if (isNaN(val)) return;
    onUpdateGoalProgress(goal.id, val);

    // If reached, trigger confetti
    const reached =
      goal.direction === 'decrease' ? val <= goal.targetValue : val >= goal.targetValue;
    if (reached) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }

    setInlineUpdateGoalId(null);
    setInlineValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar with filters and action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Targets & Milestones</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredGoals.length} Goals Displayed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
            Personal Fitness Goals
          </h1>
        </div>

        <button
          onClick={onOpenCreateGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 rounded-lg shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>

          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 sm:w-48 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const progress = calculateGoalProgress(goal);
          const isCompleted = goal.status === 'completed' || progress >= 100;

          // Days left calculation
          const targetDateObj = new Date(goal.targetDate);
          const nowDateObj = new Date('2026-11-11');
          const daysLeft = Math.ceil(
            (targetDateObj.getTime() - nowDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={goal.id}
              className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top status & category row */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize">{goal.category.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-medium ${
                        goal.priority === 'high'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {goal.priority.toUpperCase()} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      title="Edit Goal"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      title="Delete Goal"
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {goal.title}
                </h3>

                {goal.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                {/* Values strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      Starting
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {goal.startValue} {goal.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      Current
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {goal.currentValue} {goal.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      Target Goal
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {goal.targetValue} {goal.unit}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      Progress
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones list */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Milestones ({goal.milestones.filter((m) => m.achieved).length}/{goal.milestones.length})
                    </div>
                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => onToggleMilestone(goal.id, m.id)}
                          className="w-full flex items-center justify-between text-left p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {m.achieved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 shrink-0" />
                            )}
                            <span
                              className={`${
                                m.achieved
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-700 dark:text-slate-300 font-medium'
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                            {m.targetValue} {goal.unit}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom action row */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {daysLeft > 0 ? (
                    <span>{daysLeft} days remaining</span>
                  ) : daysLeft === 0 ? (
                    <span className="text-amber-500 font-semibold">Deadline today</span>
                  ) : (
                    <span className="text-slate-400">Past target date</span>
                  )}
                </div>

                {inlineUpdateGoalId === goal.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      placeholder={goal.currentValue.toString()}
                      value={inlineValue}
                      onChange={(e) => setInlineValue(e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleInlineSubmit(goal)}
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setInlineUpdateGoalId(null)}
                      className="p-1 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setInlineUpdateGoalId(goal.id);
                        setInlineValue(goal.currentValue.toString());
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Log Value
                    </button>
                    <button
                      onClick={() =>
                        onToggleGoalStatus(
                          goal.id,
                          isCompleted ? 'in_progress' : 'completed'
                        )
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {isCompleted ? 'Mark Active' : 'Mark Achieved'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
            <Target className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No matching fitness goals found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your category filter, search query, or create a new goal.
            </p>
            <button
              onClick={onOpenCreateGoal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Goal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
