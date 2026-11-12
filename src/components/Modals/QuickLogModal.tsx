import React, { useState } from 'react';
import { X, Scale, Dumbbell, Droplet, Footprints, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FitnessGoal, WorkoutLog, DailyHabit, ExerciseSet } from '../../types/fitness';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: FitnessGoal[];
  onUpdateGoalProgress: (goalId: string, newValue: number, note?: string) => void;
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  onUpdateHabit: (habitId: string, date: string, deltaOrValue: number, isDelta: boolean) => void;
  habits: DailyHabit[];
}

export function QuickLogModal({
  isOpen,
  onClose,
  goals,
  onUpdateGoalProgress,
  onAddWorkout,
  onUpdateHabit,
  habits,
}: QuickLogModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'goal' | 'workout' | 'habit'>('goal');

  // Goal log state
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || '');
  const [metricValue, setMetricValue] = useState<string>('');
  const [metricDate, setMetricDate] = useState('2026-11-11');
  const [metricNote, setMetricNote] = useState('');

  // Workout log state
  const [workoutTitle, setWorkoutTitle] = useState('Upper Body Push Session');
  const [workoutCategory, setWorkoutCategory] = useState<'strength' | 'cardio' | 'hiit' | 'mobility' | 'recovery'>('strength');
  const [workoutDuration, setWorkoutDuration] = useState('50');
  const [workoutCalories, setWorkoutCalories] = useState('420');
  const [workoutRpe, setWorkoutRpe] = useState('7');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercisesList, setExercisesList] = useState<ExerciseSet[]>([
    { name: 'Barbell Bench Press', sets: 4, reps: 6, weightKg: 85 },
    { name: 'Incline Dumbbell Flyes', sets: 3, reps: 10, weightKg: 20 },
  ]);

  // Habit quick adds
  const today = '2026-11-11';
  const waterHabit = habits.find((h) => h.id === 'habit-water');
  const stepsHabit = habits.find((h) => h.id === 'habit-steps');
  const proteinHabit = habits.find((h) => h.id === 'habit-protein');

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(metricValue);
    if (isNaN(val) || !selectedGoal) return;

    onUpdateGoalProgress(selectedGoal.id, val, metricNote);

    // If goal reached or close to target, trigger celebratory confetti
    const reached =
      selectedGoal.direction === 'decrease'
        ? val <= selectedGoal.targetValue
        : val >= selectedGoal.targetValue;

    if (reached) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }

    onClose();
  };

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle.trim()) return;

    onAddWorkout({
      date: metricDate,
      title: workoutTitle.trim(),
      category: workoutCategory,
      durationMinutes: parseInt(workoutDuration) || 45,
      caloriesBurned: parseInt(workoutCalories) || 350,
      perceivedEffort: parseInt(workoutRpe) || 7,
      notes: workoutNotes.trim() || undefined,
      exercises: exercisesList.filter((ex) => ex.name.trim().length > 0),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white font-display">
              Quick Log Activity
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record progress, workouts, or daily habits
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('goal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'goal'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Goal & Weight</span>
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'workout'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Log Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('habit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'habit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Daily Habits</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'goal' && (
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Goal to Update
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => {
                    setSelectedGoalId(e.target.value);
                    const g = goals.find((item) => item.id === e.target.value);
                    if (g) setMetricValue(g.currentValue.toString());
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.currentValue} {g.unit} → target {g.targetValue} {g.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedGoal && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Current Value:</span>
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                      {selectedGoal.currentValue} {selectedGoal.unit}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Goal:</span>
                    <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {selectedGoal.targetValue} {selectedGoal.unit}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="font-mono">{selectedGoal.targetDate}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Value ({selectedGoal?.unit || 'value'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={selectedGoal?.currentValue.toString() || '0'}
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Log Date
                  </label>
                  <input
                    type="date"
                    required
                    value={metricDate}
                    onChange={(e) => setMetricDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Note / Context (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Morning weigh-in, felt hydrated"
                  value={metricNote}
                  onChange={(e) => setMetricNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                >
                  Save Progress
                </button>
              </div>
            </form>
          )}

          {activeTab === 'workout' && (
            <form onSubmit={handleWorkoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="e.g. Legs & Posterior Chain"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={workoutCategory}
                    onChange={(e) => setWorkoutCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="strength">Strength & Resistance</option>
                    <option value="cardio">Cardio & Running</option>
                    <option value="hiit">HIIT & Circuits</option>
                    <option value="mobility">Mobility & Flex</option>
                    <option value="recovery">Active Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Calories Burned
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={workoutCalories}
                    onChange={(e) => setWorkoutCalories(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Perceived Effort (RPE 1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={workoutRpe}
                    onChange={(e) => setWorkoutRpe(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Exercises summary */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Logged Exercises ({exercisesList.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setExercisesList([
                        ...exercisesList,
                        { name: '', sets: 3, reps: 10, weightKg: 0 },
                      ])
                    }
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    + Add Exercise
                  </button>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {exercisesList.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].name = e.target.value;
                          setExercisesList(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].sets = parseInt(e.target.value) || 0;
                          setExercisesList(updated);
                        }}
                        className="w-12 px-1.5 py-1 text-center font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                      />
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].reps = parseInt(e.target.value) || 0;
                          setExercisesList(updated);
                        }}
                        className="w-12 px-1.5 py-1 text-center font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                      />
                      <input
                        type="number"
                        placeholder="kg"
                        value={ex.weightKg || ''}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].weightKg = parseFloat(e.target.value) || undefined;
                          setExercisesList(updated);
                        }}
                        className="w-16 px-1.5 py-1 text-center font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Session Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="How did recovery feel? Any notable energy highs or fatigue?"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                >
                  Log Workout
                </button>
              </div>
            </form>
          )}

          {activeTab === 'habit' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                1-tap quick log for today's physical metrics:
              </div>

              {/* Water */}
              {waterHabit && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Hydration Today
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {waterHabit.history[today] || 0} / {waterHabit.target} ml
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateHabit('habit-water', today, 250, true)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors"
                    >
                      +250ml
                    </button>
                    <button
                      onClick={() => onUpdateHabit('habit-water', today, 500, true)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                    >
                      +500ml
                    </button>
                  </div>
                </div>
              )}

              {/* Steps */}
              {stepsHabit && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Steps Today
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {stepsHabit.history[today] || 0} / {stepsHabit.target} steps
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateHabit('habit-steps', today, 1000, true)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
                    >
                      +1,000
                    </button>
                    <button
                      onClick={() => onUpdateHabit('habit-steps', today, 2500, true)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      +2,500
                    </button>
                  </div>
                </div>
              )}

              {/* Protein */}
              {proteinHabit && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Protein Intake
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {proteinHabit.history[today] || 0} / {proteinHabit.target} g
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateHabit('habit-protein', today, 25, true)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 transition-colors"
                    >
                      +25g
                    </button>
                    <button
                      onClick={() => onUpdateHabit('habit-protein', today, 40, true)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-500 transition-colors"
                    >
                      +40g
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
