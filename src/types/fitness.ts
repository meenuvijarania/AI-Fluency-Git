export type GoalCategory = 'weight' | 'strength' | 'endurance' | 'habit' | 'body_metric';

export type GoalPriority = 'high' | 'medium' | 'low';

export type GoalStatus = 'in_progress' | 'completed' | 'paused';

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  achieved: boolean;
  achievedDate?: string;
}

export interface ProgressEntry {
  date: string; // YYYY-MM-DD
  value: number;
  note?: string;
}

export interface FitnessGoal {
  id: string;
  title: string;
  category: GoalCategory;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  direction: 'decrease' | 'increase';
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  status: GoalStatus;
  milestones: Milestone[];
  notes?: string;
  priority: GoalPriority;
  history: ProgressEntry[];
}

export interface ExerciseSet {
  name: string;
  sets: number;
  reps: number;
  weightKg?: number;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'recovery';
  durationMinutes: number;
  caloriesBurned: number;
  exercises: ExerciseSet[];
  perceivedEffort: number; // 1-10
  notes?: string;
}

export interface DailyHabit {
  id: string;
  name: string;
  target: number;
  unit: string;
  history: Record<string, number>; // YYYY-MM-DD -> value
}

export interface UserProfile {
  name: string;
  tagline: string;
  avatarUrl: string;
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'mi';
  weeklyWorkoutTarget: number;
  dailyStepTarget: number;
  dailyWaterTargetMl: number;
  dailyCalorieTarget: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: GoalCategory | 'consistency';
  unlocked: boolean;
  unlockedDate?: string;
  progress: number; // 0 to 100
}
