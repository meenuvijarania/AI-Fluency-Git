/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FitnessGoal, WorkoutLog, DailyHabit, UserProfile, AchievementBadge, GoalStatus } from './types/fitness';
import {
  loadStoredGoals,
  saveStoredGoals,
  loadStoredWorkouts,
  saveStoredWorkouts,
  loadStoredHabits,
  saveStoredHabits,
  loadStoredProfile,
  saveStoredProfile,
  loadStoredBadges,
  saveStoredBadges,
  resetAllDataToDefault,
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { WorkoutsView } from './components/WorkoutsView';
import { AnalyticsView } from './components/AnalyticsView';
import { MilestonesView } from './components/MilestonesView';
import { QuickLogModal } from './components/Modals/QuickLogModal';
import { GoalModal } from './components/Modals/GoalModal';
import { SettingsModal } from './components/Modals/SettingsModal';

export default function App() {
  const [goals, setGoals] = useState<FitnessGoal[]>(() => loadStoredGoals());
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => loadStoredWorkouts());
  const [habits, setHabits] = useState<DailyHabit[]>(() => loadStoredHabits());
  const [profile, setProfile] = useState<UserProfile>(() => loadStoredProfile());
  const [badges, setBadges] = useState<AchievementBadge[]>(() => loadStoredBadges());

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'goals' | 'workouts' | 'analytics' | 'milestones'>('dashboard');

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_fitness_theme_v1');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark') || true;
    }
    return true;
  });

  // Modal states
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FitnessGoal | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pulse_fitness_theme_v1', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pulse_fitness_theme_v1', 'light');
    }
  }, [isDark]);

  // Save changes to storage whenever states change
  useEffect(() => {
    saveStoredGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveStoredWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    saveStoredHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredBadges(badges);
  }, [badges]);

  // Goal Progress Update Handler
  const handleUpdateGoalProgress = (goalId: string, newValue: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;

        // Check if goal completed
        const isReached =
          g.direction === 'decrease' ? newValue <= g.targetValue : newValue >= g.targetValue;

        // Auto-check any milestones achieved by this new value
        const updatedMilestones = g.milestones.map((m) => {
          if (m.achieved) return m;
          const mReached =
            g.direction === 'decrease' ? newValue <= m.targetValue : newValue >= m.targetValue;
          if (mReached) {
            return { ...m, achieved: true, achievedDate: today };
          }
          return m;
        });

        const newHistory = [
          ...g.history,
          { date: today, value: newValue, note: note || undefined },
        ];

        return {
          ...g,
          currentValue: newValue,
          status: isReached ? 'completed' : g.status,
          milestones: updatedMilestones,
          history: newHistory,
        };
      })
    );

    // Also check badges progression
    checkBadgeUnlocks(goalId, newValue);
  };

  const checkBadgeUnlocks = (goalId: string, val: number) => {
    setBadges((prevBadges) =>
      prevBadges.map((b) => {
        if (b.unlocked) return b;

        // Bench press 100kg
        if (b.id === 'b-club100' && goalId === 'goal-bench') {
          const pct = Math.min(100, Math.round((val / 100) * 100));
          if (val >= 100) {
            return { ...b, unlocked: true, unlockedDate: new Date().toISOString().split('T')[0], progress: 100 };
          }
          return { ...b, progress: pct };
        }

        // 5k sub-25
        if (b.id === 'b-5k-sub25' && goalId === 'goal-5k') {
          if (val <= 25) {
            return { ...b, unlocked: true, unlockedDate: new Date().toISOString().split('T')[0], progress: 100 };
          }
        }

        return b;
      })
    );
  };

  // Add Workout Handler
  const handleAddWorkout = (workoutData: Omit<WorkoutLog, 'id'>) => {
    const newWorkout: WorkoutLog = {
      ...workoutData,
      id: `w-${Date.now()}`,
    };

    setWorkouts((prev) => [newWorkout, ...prev]);

    // Check if workout exercises advance any goals (e.g., higher weight logged)
    newWorkout.exercises.forEach((ex) => {
      if (ex.weightKg) {
        if (ex.name.toLowerCase().includes('bench')) {
          const benchGoal = goals.find((g) => g.id === 'goal-bench');
          if (benchGoal && ex.weightKg > benchGoal.currentValue) {
            handleUpdateGoalProgress(benchGoal.id, ex.weightKg, `PR from workout: ${newWorkout.title}`);
          }
        } else if (ex.name.toLowerCase().includes('deadlift')) {
          const dlGoal = goals.find((g) => g.id === 'goal-deadlift');
          if (dlGoal && ex.weightKg > dlGoal.currentValue) {
            handleUpdateGoalProgress(dlGoal.id, ex.weightKg, `PR from workout: ${newWorkout.title}`);
          }
        }
      }
    });

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (e) {}
  };

  // Delete Workout
  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  };

  // Habit Update Handler
  const handleUpdateHabit = (
    habitId: string,
    date: string,
    deltaOrValue: number,
    isDelta: boolean
  ) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentVal = h.history[date] || 0;
        const newVal = isDelta ? Math.max(0, currentVal + deltaOrValue) : deltaOrValue;
        return {
          ...h,
          history: {
            ...h.history,
            [date]: newVal,
          },
        };
      })
    );
  };

  // Save Goal
  const handleSaveGoal = (goalToSave: FitnessGoal) => {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === goalToSave.id);
      if (exists) {
        return prev.map((g) => (g.id === goalToSave.id ? goalToSave : g));
      }
      return [goalToSave, ...prev];
    });
  };

  // Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Toggle Milestone Checkbox
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const today = new Date().toISOString().split('T')[0];
        const updated = g.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const nextState = !m.achieved;
          return {
            ...m,
            achieved: nextState,
            achievedDate: nextState ? today : undefined,
          };
        });

        // Trigger celebratory confetti if newly unlocked
        const toggledItem = g.milestones.find((m) => m.id === milestoneId);
        if (toggledItem && !toggledItem.achieved) {
          try {
            confetti({ particleCount: 50, spread: 55, origin: { y: 0.7 } });
          } catch (e) {}
        }

        return { ...g, milestones: updated };
      })
    );
  };

  // Toggle Goal Status
  const handleToggleGoalStatus = (goalId: string, newStatus: GoalStatus) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        if (newStatus === 'completed') {
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
          } catch (e) {}
        }
        return { ...g, status: newStatus };
      })
    );
  };

  // Reset to initial sample data
  const handleResetData = () => {
    resetAllDataToDefault();
    setGoals(loadStoredGoals());
    setWorkouts(loadStoredWorkouts());
    setHabits(loadStoredHabits());
    setProfile(loadStoredProfile());
    setBadges(loadStoredBadges());
  };

  const handleDataImported = () => {
    setGoals(loadStoredGoals());
    setWorkouts(loadStoredWorkouts());
    setHabits(loadStoredHabits());
    setProfile(loadStoredProfile());
    setBadges(loadStoredBadges());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract Compliant Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            goals={goals}
            workouts={workouts}
            habits={habits}
            profile={profile}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onOpenCreateGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onSelectTab={setCurrentTab}
            onUpdateGoalProgress={handleUpdateGoalProgress}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            onOpenCreateGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onToggleMilestone={handleToggleMilestone}
            onToggleGoalStatus={handleToggleGoalStatus}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutsView
            workouts={workouts}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            goals={goals}
            workouts={workouts}
            habits={habits}
          />
        )}

        {currentTab === 'milestones' && (
          <MilestonesView badges={badges} />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">PULSE</span>
            <span aria-hidden="true">·</span>
            <span>Personal Fitness Performance & Goal Tracking</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Local Browser Storage</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline text-slate-600 dark:text-slate-300"
            >
              Export Data Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        goals={goals}
        onUpdateGoalProgress={handleUpdateGoalProgress}
        onAddWorkout={handleAddWorkout}
        onUpdateHabit={handleUpdateHabit}
        habits={habits}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSaveGoal={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onResetData={handleResetData}
        onDataImported={handleDataImported}
      />
    </div>
  );
}
