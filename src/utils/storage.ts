import { FitnessGoal, WorkoutLog, DailyHabit, UserProfile, AchievementBadge } from '../types/fitness';
import { INITIAL_GOALS, INITIAL_WORKOUTS, INITIAL_HABITS, INITIAL_PROFILE, INITIAL_BADGES } from '../data/initialData';

const STORAGE_KEYS = {
  GOALS: 'pulse_fitness_goals_v1',
  WORKOUTS: 'pulse_fitness_workouts_v1',
  HABITS: 'pulse_fitness_habits_v1',
  PROFILE: 'pulse_fitness_profile_v1',
  BADGES: 'pulse_fitness_badges_v1',
  THEME: 'pulse_fitness_theme_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to parse storage item ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to persist storage item ${key}:`, err);
  }
}

export function loadStoredGoals(): FitnessGoal[] {
  return safeGet<FitnessGoal[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS);
}

export function saveStoredGoals(goals: FitnessGoal[]): void {
  safeSet(STORAGE_KEYS.GOALS, goals);
}

export function loadStoredWorkouts(): WorkoutLog[] {
  return safeGet<WorkoutLog[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
}

export function saveStoredWorkouts(workouts: WorkoutLog[]): void {
  safeSet(STORAGE_KEYS.WORKOUTS, workouts);
}

export function loadStoredHabits(): DailyHabit[] {
  return safeGet<DailyHabit[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
}

export function saveStoredHabits(habits: DailyHabit[]): void {
  safeSet(STORAGE_KEYS.HABITS, habits);
}

export function loadStoredProfile(): UserProfile {
  return safeGet<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
}

export function saveStoredProfile(profile: UserProfile): void {
  safeSet(STORAGE_KEYS.PROFILE, profile);
}

export function loadStoredBadges(): AchievementBadge[] {
  return safeGet<AchievementBadge[]>(STORAGE_KEYS.BADGES, INITIAL_BADGES);
}

export function saveStoredBadges(badges: AchievementBadge[]): void {
  safeSet(STORAGE_KEYS.BADGES, badges);
}

export function resetAllDataToDefault(): void {
  safeSet(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  safeSet(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
  safeSet(STORAGE_KEYS.HABITS, INITIAL_HABITS);
  safeSet(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  safeSet(STORAGE_KEYS.BADGES, INITIAL_BADGES);
}

export function exportAllDataJSON(): string {
  const payload = {
    exportDate: new Date().toISOString(),
    goals: loadStoredGoals(),
    workouts: loadStoredWorkouts(),
    habits: loadStoredHabits(),
    profile: loadStoredProfile(),
    badges: loadStoredBadges(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.goals && Array.isArray(parsed.goals)) saveStoredGoals(parsed.goals);
    if (parsed.workouts && Array.isArray(parsed.workouts)) saveStoredWorkouts(parsed.workouts);
    if (parsed.habits && Array.isArray(parsed.habits)) safeSet(STORAGE_KEYS.HABITS, parsed.habits);
    if (parsed.profile) saveStoredProfile(parsed.profile);
    if (parsed.badges && Array.isArray(parsed.badges)) saveStoredBadges(parsed.badges);
    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}

/**
 * Calculates progress percentage for any goal (0 to 100+)
 */
export function calculateGoalProgress(goal: FitnessGoal): number {
  if (goal.status === 'completed') return 100;
  
  const { startValue, targetValue, currentValue, direction } = goal;
  if (startValue === targetValue) return 100;

  if (direction === 'decrease') {
    // e.g. Start 85 -> Target 75. Current 80.
    const totalDistance = startValue - targetValue;
    const coveredDistance = startValue - currentValue;
    if (totalDistance <= 0) return 0;
    const pct = (coveredDistance / totalDistance) * 100;
    return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
  } else {
    // e.g. Start 80 -> Target 100. Current 95.
    const totalDistance = targetValue - startValue;
    const coveredDistance = currentValue - startValue;
    if (totalDistance <= 0) return 0;
    const pct = (coveredDistance / totalDistance) * 100;
    return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
  }
}

/**
 * Formats a metric with unit and sensible decimals
 */
export function formatMetric(val: number, unit: string): string {
  const isInteger = Math.round(val) === val;
  const numStr = isInteger ? val.toString() : val.toFixed(1);
  return `${numStr} ${unit}`;
}
