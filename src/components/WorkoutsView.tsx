import { useState } from 'react';
import { Dumbbell, Plus, Flame, Clock, Trash2, Search, Activity, Zap } from 'lucide-react';
import { WorkoutLog } from '../types/fitness';

interface WorkoutsViewProps {
  workouts: WorkoutLog[];
  onOpenQuickLog: () => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export function WorkoutsView({
  workouts,
  onOpenQuickLog,
  onDeleteWorkout,
}: WorkoutsViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Sessions' },
    { id: 'strength', label: 'Strength' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'hiit', label: 'HIIT' },
    { id: 'mobility', label: 'Mobility' },
    { id: 'recovery', label: 'Recovery' },
  ];

  const filtered = workouts.filter((w) => {
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = w.title.toLowerCase().includes(q);
      const inNotes = w.notes && w.notes.toLowerCase().includes(q);
      const inExercises = w.exercises.some((e) => e.name.toLowerCase().includes(q));
      return inTitle || inNotes || inExercises;
    }
    return true;
  });

  const totalSessions = workouts.length;
  const totalMinutes = workouts.reduce((acc, w) => acc + w.durationMinutes, 0);
  const totalCalories = workouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
  const avgRpe =
    workouts.length > 0
      ? (workouts.reduce((acc, w) => acc + w.perceivedEffort, 0) / workouts.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Training Logbook</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filtered.length} Recorded Sessions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
            Workout History & Activity
          </h1>
        </div>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 rounded-lg shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Workout Session</span>
        </button>
      </div>

      {/* Aggregate Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Workouts</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {totalSessions}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Time</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Calories Burned</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {totalCalories.toLocaleString()} <span className="text-xs font-normal">kcal</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Average RPE Effort</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-500 tabular-nums">
            {avgRpe} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exercises, titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Workouts List */}
      <div className="space-y-3.5">
        {filtered.map((workout) => (
          <div
            key={workout.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                    {workout.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">
                      {new Date(workout.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{workout.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono tabular-nums">{workout.durationMinutes}m</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono tabular-nums">{workout.caloriesBurned} kcal</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-mono tabular-nums">RPE {workout.perceivedEffort}</span>
                </div>

                <button
                  onClick={() => onDeleteWorkout(workout.id)}
                  title="Delete workout entry"
                  className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Exercises table */}
            {workout.exercises && workout.exercises.length > 0 && (
              <div className="mt-3.5 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-1.5 font-medium">Exercise</th>
                      <th className="pb-1.5 font-medium text-center">Sets</th>
                      <th className="pb-1.5 font-medium text-center">Reps</th>
                      <th className="pb-1.5 font-medium text-right">Load / Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {workout.exercises.map((ex, i) => (
                      <tr key={i} className="text-slate-700 dark:text-slate-300">
                        <td className="py-1.5 font-medium text-slate-900 dark:text-white">
                          {ex.name}
                        </td>
                        <td className="py-1.5 text-center font-mono tabular-nums text-slate-500">
                          {ex.sets}
                        </td>
                        <td className="py-1.5 text-center font-mono tabular-nums text-slate-500">
                          {ex.reps}
                        </td>
                        <td className="py-1.5 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {ex.weightKg ? `${ex.weightKg} kg` : 'Bodyweight'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {workout.notes && (
              <div className="mt-3 text-xs italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                "{workout.notes}"
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
            <Dumbbell className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No matching workouts found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Log your training session to track sets, reps, and progression.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
