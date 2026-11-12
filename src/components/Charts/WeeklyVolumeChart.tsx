import { useState } from 'react';
import { WorkoutLog } from '../../types/fitness';

interface WeeklyVolumeChartProps {
  workouts: WorkoutLog[];
}

export function WeeklyVolumeChart({ workouts }: WeeklyVolumeChartProps) {
  const [metric, setMetric] = useState<'duration' | 'calories'>('duration');
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    dayLabel: string;
    value: number;
    workouts: WorkoutLog[];
  } | null>(null);

  // Generate 7 days ending at current applet date (2026-11-11)
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
  const dates = [
    '2026-11-05',
    '2026-11-06',
    '2026-11-07',
    '2026-11-08',
    '2026-11-09',
    '2026-11-10',
    '2026-11-11',
  ];

  const dayStats = dates.map((dateStr, idx) => {
    const dayWorkouts = workouts.filter((w) => w.date === dateStr);
    const duration = dayWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);
    const calories = dayWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
    return {
      date: dateStr,
      dayLabel: days[idx],
      isToday: idx === dates.length - 1,
      duration,
      calories,
      workouts: dayWorkouts,
    };
  });

  const maxDuration = Math.max(75, ...dayStats.map((d) => d.duration));
  const maxCalories = Math.max(600, ...dayStats.map((d) => d.calories));
  const maxVal = metric === 'duration' ? maxDuration : maxCalories;

  const totalWeeklyDuration = dayStats.reduce((acc, d) => acc + d.duration, 0);
  const totalWeeklyCalories = dayStats.reduce((acc, d) => acc + d.calories, 0);
  const totalWeeklySessions = dayStats.filter((d) => d.workouts.length > 0).length;

  return (
    <div className="w-full">
      {/* Header controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>Weekly Sessions: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{totalWeeklySessions}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Total Time: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{totalWeeklyDuration}m</strong></span>
          <span aria-hidden="true">·</span>
          <span>Burned: <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{totalWeeklyCalories} kcal</strong></span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setMetric('duration')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              metric === 'duration'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Duration (min)
          </button>
          <button
            onClick={() => setMetric('calories')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              metric === 'calories'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Calories (kcal)
          </button>
        </div>
      </div>

      {/* Bar visual chart */}
      <div className="relative pt-4 pb-2">
        <div className="grid grid-cols-7 gap-2 md:gap-3 items-end h-40 border-b border-slate-200 dark:border-slate-800 pb-2">
          {dayStats.map((day) => {
            const val = metric === 'duration' ? day.duration : day.calories;
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const hasWorkout = day.workouts.length > 0;

            return (
              <div
                key={day.date}
                className="group relative flex flex-col items-center h-full justify-end"
                onMouseEnter={() =>
                  setHoveredDay({
                    date: day.date,
                    dayLabel: day.dayLabel,
                    value: val,
                    workouts: day.workouts,
                  })
                }
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/50 rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${Math.max(hasWorkout ? 12 : 4, pct)}%` }}
                    className={`w-full rounded-xs transition-all duration-300 ${
                      hasWorkout
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300'
                        : 'bg-slate-200 dark:bg-slate-700/40'
                    }`}
                  />
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block font-mono text-[11px] ${
                      day.isToday
                        ? 'font-bold text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  <span className="block font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                    {val > 0 ? (metric === 'duration' ? `${val}m` : `${val}`) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating tooltip */}
        {hoveredDay && (
          <div className="absolute top-0 right-0 z-10 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 px-3 py-2 text-xs text-white shadow-lg border border-slate-700 backdrop-blur-xs">
            <div className="flex items-center justify-between gap-4 font-medium">
              <span>{hoveredDay.dayLabel} ({hoveredDay.date})</span>
              <span className="font-mono text-emerald-400 tabular-nums">
                {metric === 'duration' ? `${hoveredDay.value} mins` : `${hoveredDay.value} kcal`}
              </span>
            </div>
            {hoveredDay.workouts.length > 0 ? (
              <div className="mt-1 space-y-1">
                {hoveredDay.workouts.map((w) => (
                  <div key={w.id} className="text-[11px] text-slate-300">
                    • {w.title} ({w.durationMinutes}m · {w.caloriesBurned} kcal)
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-slate-400 italic">Rest / Recovery day</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
