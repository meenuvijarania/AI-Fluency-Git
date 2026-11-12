import { useState } from 'react';
import { TrendingUp, Calendar, Zap, Award, Target, CheckCircle } from 'lucide-react';
import { FitnessGoal, WorkoutLog, DailyHabit } from '../types/fitness';
import { calculateGoalProgress } from '../utils/storage';
import { TrendLineChart } from './Charts/TrendLineChart';

interface AnalyticsViewProps {
  goals: FitnessGoal[];
  workouts: WorkoutLog[];
  habits: DailyHabit[];
}

export function AnalyticsView({ goals, workouts, habits }: AnalyticsViewProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals[0]?.id || ''
  );

  const goal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  // 28-Day Activity Consistency Heatmap (ending at 2026-11-11)
  const heatmapDays: { date: string; dayNum: number; hasWorkout: boolean; habitCount: number }[] = [];
  const baseTime = new Date('2026-11-11').getTime();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(baseTime - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const hasWorkout = workouts.some((w) => w.date === dateStr);
    let habitCount = 0;
    habits.forEach((h) => {
      if (h.history[dateStr] && h.history[dateStr] >= h.target * 0.8) {
        habitCount++;
      }
    });

    heatmapDays.push({
      date: dateStr,
      dayNum: d.getDate(),
      hasWorkout,
      habitCount,
    });
  }

  const activeDaysCount = heatmapDays.filter((d) => d.hasWorkout || d.habitCount > 0).length;
  const consistencyRate = Math.round((activeDaysCount / 28) * 100);

  // Compute goal trajectory metrics
  let weeklyPace = 0;
  let estimatedDaysLeft = 0;
  let estimatedCompletionDate = 'N/A';

  if (goal && goal.history.length >= 2) {
    const first = goal.history[0];
    const latest = goal.history[goal.history.length - 1];
    const totalDays = Math.max(
      1,
      (new Date(latest.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalWeeks = totalDays / 7;
    const totalChange = latest.value - first.value;
    weeklyPace = Math.round((totalChange / totalWeeks) * 100) / 100;

    const remainingDistance = Math.abs(goal.targetValue - latest.value);
    if (Math.abs(weeklyPace) > 0.01) {
      const weeksToGoal = remainingDistance / Math.abs(weeklyPace);
      estimatedDaysLeft = Math.round(weeksToGoal * 7);
      const estDate = new Date(baseTime + estimatedDaysLeft * 24 * 60 * 60 * 1000);
      estimatedCompletionDate = estDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  const progress = goal ? calculateGoalProgress(goal) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Performance Metrics</span>
            <span aria-hidden="true">·</span>
            <span>Trajectory Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
            Progress Analytics & Consistency
          </h1>
        </div>

        {/* Goal Selector */}
        {goals.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Selected Goal:
            </span>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white shadow-xs focus:outline-hidden"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.currentValue} → {g.targetValue} {g.unit})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {goal && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Trajectory Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Historical Trajectory
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mt-0.5">
                    {goal.title}
                  </h2>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {progress}% Complete
                </div>
              </div>

              <TrendLineChart
                history={goal.history}
                targetValue={goal.targetValue}
                unit={goal.unit}
                goalTitle={goal.title}
                direction={goal.direction}
              />
            </div>

            {/* Checkpoints table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-3">
                Milestone Verification Path
              </h3>
              <div className="space-y-2">
                {goal.milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      m.achieved
                        ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                          m.achieved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {m.achieved ? '✓' : idx + 1}
                      </div>
                      <div>
                        <div
                          className={`font-medium ${
                            m.achieved
                              ? 'text-emerald-900 dark:text-emerald-200 font-semibold'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {m.title}
                        </div>
                        {m.achievedDate && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Achieved on {m.achievedDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="font-mono text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {m.targetValue} {goal.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Predictive Stats & 28-day Heatmap (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Predictive trajectory card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Trajectory Pace
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mt-0.5">
                  Predictive Pace Modeling
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Average Weekly Pace
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {weeklyPace > 0 ? `+${weeklyPace}` : weeklyPace} {goal.unit} / week
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Estimated Arrival Date
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {estimatedCompletionDate}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Target deadline is {goal.targetDate}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Remaining Distance
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {Math.abs(Math.round((goal.targetValue - goal.currentValue) * 10) / 10)} {goal.unit}
                  </div>
                </div>
              </div>
            </div>

            {/* 28-day Activity Heatmap */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Discipline Matrix
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mt-0.5">
                    28-Day Consistency
                  </h3>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {consistencyRate}%
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {heatmapDays.map((d) => {
                  let bg = 'bg-slate-100 dark:bg-slate-800';
                  if (d.hasWorkout && d.habitCount >= 2) {
                    bg = 'bg-emerald-600 text-white';
                  } else if (d.hasWorkout) {
                    bg = 'bg-emerald-500/80 text-white';
                  } else if (d.habitCount > 0) {
                    bg = 'bg-emerald-500/40 text-emerald-950 dark:text-emerald-200';
                  }

                  return (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.hasWorkout ? 'Workout logged' : 'No workout'}`}
                      className={`h-7 rounded flex items-center justify-center font-mono text-[10px] tabular-nums font-medium transition-colors ${bg}`}
                    >
                      {d.dayNum}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>28 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
