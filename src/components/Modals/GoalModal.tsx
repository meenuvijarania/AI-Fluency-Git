import React, { useState, useEffect } from 'react';
import { X, Sparkles, Target } from 'lucide-react';
import { FitnessGoal, GoalCategory, GoalPriority, Milestone } from '../../types/fitness';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: FitnessGoal) => void;
  editingGoal?: FitnessGoal | null;
}

const PRESETS = [
  {
    name: 'Body Weight Loss',
    category: 'weight' as GoalCategory,
    direction: 'decrease' as const,
    unit: 'kg',
    defaultStart: 85,
    defaultTarget: 75,
    notes: 'Sustainable caloric deficit with resistance training',
  },
  {
    name: 'Strength PR: Barbell Bench Press',
    category: 'strength' as GoalCategory,
    direction: 'increase' as const,
    unit: 'kg',
    defaultStart: 80,
    defaultTarget: 100,
    notes: 'Paused reps and progressive overload',
  },
  {
    name: 'Strength PR: Squat / Deadlift',
    category: 'strength' as GoalCategory,
    direction: 'increase' as const,
    unit: 'kg',
    defaultStart: 120,
    defaultTarget: 150,
    notes: 'Lower body compound power progression',
  },
  {
    name: '5K Run Time Improvement',
    category: 'endurance' as GoalCategory,
    direction: 'decrease' as const,
    unit: 'min',
    defaultStart: 30,
    defaultTarget: 24,
    notes: 'Aerobic base + weekly threshold intervals',
  },
  {
    name: 'Body Fat Percentage',
    category: 'body_metric' as GoalCategory,
    direction: 'decrease' as const,
    unit: '%',
    defaultStart: 20,
    defaultTarget: 14,
    notes: 'Lean athletic recomposition',
  },
  {
    name: 'Weekly Workout Consistency',
    category: 'habit' as GoalCategory,
    direction: 'increase' as const,
    unit: 'days/wk',
    defaultStart: 2,
    defaultTarget: 4,
    notes: 'Consistent weekly routine',
  },
];

export function GoalModal({
  isOpen,
  onClose,
  onSaveGoal,
  editingGoal,
}: GoalModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('weight');
  const [direction, setDirection] = useState<'decrease' | 'increase'>('decrease');
  const [unit, setUnit] = useState('kg');
  const [startValue, setStartValue] = useState('85');
  const [currentValue, setCurrentValue] = useState('85');
  const [targetValue, setTargetValue] = useState('75');
  const [startDate, setStartDate] = useState('2026-11-11');
  const [targetDate, setTargetDate] = useState('2027-02-15');
  const [priority, setPriority] = useState<GoalPriority>('high');
  const [notes, setNotes] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setCategory(editingGoal.category);
      setDirection(editingGoal.direction);
      setUnit(editingGoal.unit);
      setStartValue(editingGoal.startValue.toString());
      setCurrentValue(editingGoal.currentValue.toString());
      setTargetValue(editingGoal.targetValue.toString());
      setStartDate(editingGoal.startDate);
      setTargetDate(editingGoal.targetDate);
      setPriority(editingGoal.priority);
      setNotes(editingGoal.notes || '');
      setMilestones(editingGoal.milestones || []);
    } else {
      // Default to first preset
      applyPreset(PRESETS[0]);
    }
  }, [editingGoal]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.name);
    setCategory(preset.category);
    setDirection(preset.direction);
    setUnit(preset.unit);
    setStartValue(preset.defaultStart.toString());
    setCurrentValue(preset.defaultStart.toString());
    setTargetValue(preset.defaultTarget.toString());
    setNotes(preset.notes);

    // Auto-generate 3 milestones
    const start = preset.defaultStart;
    const target = preset.defaultTarget;
    const diff = target - start;
    const m1 = Math.round((start + diff * 0.33) * 10) / 10;
    const m2 = Math.round((start + diff * 0.66) * 10) / 10;

    setMilestones([
      { id: 'm-1', title: `Phase 1: ${m1} ${preset.unit}`, targetValue: m1, achieved: false },
      { id: 'm-2', title: `Phase 2: ${m2} ${preset.unit}`, targetValue: m2, achieved: false },
      { id: 'm-3', title: `Target Milestone: ${target} ${preset.unit}`, targetValue: target, achieved: false },
    ]);
  };

  const handleAutoGenerateMilestones = () => {
    const s = parseFloat(startValue);
    const t = parseFloat(targetValue);
    if (isNaN(s) || isNaN(t)) return;
    const diff = t - s;
    const m1 = Math.round((s + diff * 0.33) * 10) / 10;
    const m2 = Math.round((s + diff * 0.66) * 10) / 10;

    setMilestones([
      { id: `m-${Date.now()}-1`, title: `Checkpoint 1 (${m1} ${unit})`, targetValue: m1, achieved: false },
      { id: `m-${Date.now()}-2`, title: `Checkpoint 2 (${m2} ${unit})`, targetValue: m2, achieved: false },
      { id: `m-${Date.now()}-3`, title: `Final Goal (${t} ${unit})`, targetValue: t, achieved: false },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sVal = parseFloat(startValue);
    const cVal = parseFloat(currentValue);
    const tVal = parseFloat(targetValue);

    if (isNaN(sVal) || isNaN(tVal)) return;

    const goalToSave: FitnessGoal = {
      id: editingGoal ? editingGoal.id : `goal-${Date.now()}`,
      title: title.trim(),
      category,
      direction,
      unit: unit.trim(),
      startValue: sVal,
      currentValue: isNaN(cVal) ? sVal : cVal,
      targetValue: tVal,
      startDate,
      targetDate,
      priority,
      status: editingGoal ? editingGoal.status : 'in_progress',
      notes: notes.trim() || undefined,
      milestones,
      history: editingGoal ? editingGoal.history : [{ date: startDate, value: isNaN(cVal) ? sVal : cVal, note: 'Initial setup' }],
    };

    onSaveGoal(goalToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white font-display">
                {editingGoal ? 'Edit Fitness Goal' : 'Create New Fitness Goal'}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Define measurable targets, target deadlines & milestones
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!editingGoal && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Start from a Fitness Preset:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
                  >
                    <div className="font-medium text-slate-900 dark:text-white truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                      {preset.defaultStart} → {preset.defaultTarget} {preset.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reach Target Weight 75 kg"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="weight">Body Weight</option>
                  <option value="strength">Strength PR</option>
                  <option value="endurance">Endurance / Run</option>
                  <option value="body_metric">Body Composition</option>
                  <option value="habit">Habit / Frequency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as 'decrease' | 'increase')}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="decrease">Decrease (e.g. Weight Loss / Faster Time)</option>
                  <option value="increase">Increase (e.g. PR Weight / Volume)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="kg, lbs, min, reps"
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Starting Value
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={startValue}
                  onChange={(e) => setStartValue(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Value
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Goal
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as GoalPriority)}
                  className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Milestones section */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Checkpoints & Milestones ({milestones.length})
                </span>
                <button
                  type="button"
                  onClick={handleAutoGenerateMilestones}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Auto-Calculate Milestones
                </button>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {milestones.map((m, idx) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => {
                        const updated = [...milestones];
                        updated[idx].title = e.target.value;
                        setMilestones(updated);
                      }}
                      className="flex-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                    />
                    <input
                      type="number"
                      step="any"
                      value={m.targetValue}
                      onChange={(e) => {
                        const updated = [...milestones];
                        updated[idx].targetValue = parseFloat(e.target.value) || 0;
                        setMilestones(updated);
                      }}
                      className="w-20 px-2 py-1 font-mono text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Strategy & Training Notes (optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key strategy, dietary focus, or weekly plan notes..."
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
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
