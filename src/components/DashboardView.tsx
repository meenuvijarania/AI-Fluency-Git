import { useState } from 'react';
import { Target, Flame, Calendar, Trophy, ChevronRight, Plus, CheckCircle2, TrendingUp, Sparkles, Scale, Dumbbell } from 'lucide-react';
import { FitnessGoal, WorkoutLog, DailyHabit, UserProfile } from '../types/fitness';
import { calculateGoalProgress, formatMetric } from '../utils/storage';
import { TrendLineChart } from './Charts/TrendLineChart';
import { WeeklyVolumeChart } from './Charts/WeeklyVolumeChart';

interface DashboardViewProps {
  goals: FitnessGoal[];
  workouts: WorkoutLog[];
  habits: DailyHabit[];
  profile: UserProfile;
  onOpenQuickLog: () => void;
  onOpenCreateGoal: () => void;
  onSelectTab: (tab: 'dashboard' | 'goals' | 'workouts' | 'analytics' | 'milestones') => void;
  onUpdateGoalProgress: (goalId: string, newValue: number) => void;
}

export function DashboardView({
  goals,
  workouts,
  habits,
  profile,
  onOpenQuickLog,
  onOpenCreateGoal,
  onSelectTab,
  onUpdateGoalProgress,
}: DashboardViewProps) {
  // Primary goal for trend chart (default to weight goal or first goal)
  const [selectedChartGoalId, setSelectedChartGoalId] = useState<string>(
    goals.find((g) => g.category === 'weight')?.id || goals[0]?.id || ''
  );

  const primaryGoal = goals.find((g) => g.id === selectedChartGoalId) || goals[0];

  // Calculate high-level stats
  const activeGoals = goals.filter((g) => g.status === 'in_progress');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const totalGoalProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((acc, g) => acc + calculateGoalProgress(g), 0) / goals.length
        )
      : 0;

  // Workouts in last 7 days (2026-11-05 to 2026-11-11)
  const recentWorkoutsWeek = workouts.filter((w) => {
    const d = new Date(w.date).getTime();
    const minD = new Date('2026-11-05').getTime();
    return d >= minD;
  });

  const weeklyWorkoutsCount = recentWorkoutsWeek.length;
  const weeklyCalories = recentWorkoutsWeek.reduce((acc, w) => acc + w.caloriesBurned, 0);

  // Today's habits (2026-11-11)
  const today = '2026-11-11';
  const stepsHabit = habits.find((h) => h.id === 'habit-steps');
  const waterHabit = habits.find((h) => h.id === 'habit-water');
  const proteinHabit = habits.find((h) => h.id === 'habit-protein');

  const todaySteps = stepsHabit?.history[today] || 0;
  const todayWater = waterHabit?.history[today] || 0;
  const todayProtein = proteinHabit?.history[today] || 0;

  const topPriorityGoals = [...activeGoals]
    .sort((a, b) => (a.priority === 'high' ? -1 : 1))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Athlete Welcome & Quick Action Strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-emerald-500/20 bg-slate-100 dark:bg-slate-800"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-xs">
                ★
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Welcome back</span>
                <span aria-hidden="true">·</span>
                <span>Active Plan</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Week 14 of 20
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight mt-0.5">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {profile.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateGoal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              + New Goal
            </button>
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Progress</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalGoalProgress}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              +{activeGoals.length} Active
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalGoalProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Weekly Workouts</span>
            <Dumbbell className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {weeklyWorkoutsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / {profile.weeklyWorkoutTarget} target
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            {weeklyWorkoutsCount >= profile.weeklyWorkoutTarget ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Target reached this week!
              </span>
            ) : (
              <span>{profile.weeklyWorkoutTarget - weeklyWorkoutsCount} session(s) left</span>
            )}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Weekly Calorie Burn</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {weeklyCalories}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kcal</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Across 7 training days</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Completed Goals</span>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {completedGoals.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / {goals.length} total
            </span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onSelectTab('milestones')}
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              View badges & trophies →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Goal Progress Cards & Primary Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Goal Trajectory Chart & Weekly Volume */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trajectory Chart Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Goal Trajectory</span>
                  <span aria-hidden="true">·</span>
                  <span>Historical Progress</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mt-0.5">
                  {primaryGoal ? primaryGoal.title : 'Progress Analytics'}
                </h2>
              </div>

              {/* Goal selector for chart */}
              {goals.length > 1 && (
                <select
                  value={selectedChartGoalId}
                  onChange={(e) => setSelectedChartGoalId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {primaryGoal ? (
              <TrendLineChart
                history={primaryGoal.history}
                targetValue={primaryGoal.targetValue}
                unit={primaryGoal.unit}
                goalTitle={primaryGoal.title}
                direction={primaryGoal.direction}
              />
            ) : (
              <div className="text-sm text-slate-400 py-12 text-center">
                No goals created yet.
              </div>
            )}
          </div>

          {/* Weekly Volume Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Training Activity
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mt-0.5">
                  Weekly Training Volume
                </h2>
              </div>
              <button
                onClick={() => onSelectTab('workouts')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>Workout Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <WeeklyVolumeChart workouts={workouts} />
          </div>
        </div>

        {/* Right Column (5 cols): Active Goals Spotlight & Today's Habits */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Goals Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Target Objectives
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mt-0.5">
                  Priority Fitness Goals
                </h2>
              </div>
              <button
                onClick={() => onSelectTab('goals')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>All Goals ({goals.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {topPriorityGoals.map((goal) => {
                const progress = calculateGoalProgress(goal);
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white font-display">
                          {goal.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>Current: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{goal.currentValue} {goal.unit}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>Target: <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{goal.targetValue} {goal.unit}</strong></span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        {progress}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Milestones count */}
                    {goal.milestones.length > 0 && (
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          {goal.milestones.filter((m) => m.achieved).length} of {goal.milestones.length} checkpoints unlocked
                        </span>
                        <span className="font-mono text-[10px]">Due {goal.targetDate}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {topPriorityGoals.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                  No active goals yet. Click "+ New Goal" to begin tracking.
                </div>
              )}
            </div>
          </div>

          {/* Today's Habit Tracker */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Today's Execution
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mt-0.5">
                  Daily Habit Checklist
                </h2>
              </div>
              <button
                onClick={onOpenQuickLog}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                + Log Habit
              </button>
            </div>

            <div className="space-y-3">
              {/* Steps */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono text-xs font-bold">
                    👣
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-900 dark:text-white">
                      Daily Step Count
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {todaySteps.toLocaleString()} / {stepsHabit?.target.toLocaleString() || 10000} steps
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                  {Math.round((todaySteps / (stepsHabit?.target || 10000)) * 100)}%
                </div>
              </div>

              {/* Water */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono text-xs font-bold">
                    💧
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-900 dark:text-white">
                      Hydration Target
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {todayWater} / {waterHabit?.target || 3000} ml
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                  {Math.round((todayWater / (waterHabit?.target || 3000)) * 100)}%
                </div>
              </div>

              {/* Protein */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono text-xs font-bold">
                    🍗
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-900 dark:text-white">
                      Protein Intake
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {todayProtein} / {proteinHabit?.target || 160} g
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                  {Math.round((todayProtein / (proteinHabit?.target || 160)) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
