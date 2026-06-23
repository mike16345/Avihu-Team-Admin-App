import { IBaseItem } from "./interfaces";

export type CardioType = `simple` | `complex`;

export interface IWorkoutPlan {
  _id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

/**
 * Optional metadata for any workout plan (preset or per-user).
 * Trainers set these when building the plan; the UI uses them for
 * filtering and quick-scan badges. Older plans / mobile clients that
 * don't know about these fields keep working — all fields are optional.
 */
export type WorkoutLevel = "beginner" | "intermediate" | "advanced" | "pro";
export type WorkoutGoal =
  | "fat-loss"
  | "muscle-gain"
  | "strength"
  | "endurance"
  | "toning"
  | "rehab";

export type WorkoutEquipment = "gym" | "studio" | "weights" | "bodyweight" | "weights-bodyweight";

export interface IWorkoutPlanMeta {
  workoutsPerWeek?: number;
  durationMinutes?: number;
  level?: WorkoutLevel;
  goal?: WorkoutGoal;
  /** Equipment required to follow the plan (gym, studio, weights, bodyweight). */
  equipment?: WorkoutEquipment;
  /** "full-body" or up to 3 muscle-group slugs the plan emphasises. */
  muscleFocus?: string[];
  note?: string;
  limitations?: string;
  /** Sub-trainer (or main trainer) id of whoever built this plan. */
  builtByTrainerId?: string;
}

/**
 * History / temporary-swap fields (mirrored on server in
 * `IWorkoutPlanHistory`). Each trainee may have many plan docs over
 * time — at most one has `archivedAt = null` (the active plan).
 * Restore = clone an archived doc to a new active one.
 */
export interface IWorkoutPlanHistory {
  _id?: string;
  /** Null when this plan is currently active for the trainee. */
  archivedAt?: Date | string | null;
  /** Pointer to the plan that replaced this one (set when archived). */
  replacedByPlanId?: string;
  /** Trainer id who created/assigned this plan (audit trail). */
  assignedBy?: string;
  /** When this assignment became active. */
  assignedAt?: Date | string;
  /**
   * Optional end-date for a temporary swap. Surfaces an orange
   * banner; restore is MANUAL — no cron. Pure metadata.
   */
  temporaryUntil?: Date | string;
  /** When temporary, points to the archived plan to restore to. */
  restoreToPlanId?: string;
  /** Human label shown in history ("Full-Body חודש יוני"). */
  assignmentLabel?: string;
}

export interface ICompleteWorkoutPlan extends IWorkoutPlanMeta, IWorkoutPlanHistory {
  userId?: string;
  workoutPlans: IWorkoutPlan[];
  cardio: ICardioPlan;
  tips?: string[];
}

export interface ICardioPlan {
  type: CardioType;
  plan: IComplexCardioType | ISimpleCardioType;
}

export interface ISet {
  _id?: string;
  minReps: number;
  maxReps?: number;
  restTime?: number;
}

export interface IExercise {
  _id?: string;
  exerciseId: { name: string; linkToVideo: string; _id: string; imageUrl?: string } | string;
  tipFromTrainer?: string;
  linkToVideo: string;
  exerciseMethod?: string;
  name: string;
  sets: ISet[];
  restTime: number;
}

export interface IMuscleGroupWorkouts {
  _id?: string;
  muscleGroup: string;
  exercises: IExercise[];
}

export interface IWorkoutPlanPreset extends IWorkoutPlanMeta {
  name: string;
  tips?: string[];
  workoutPlans: IWorkoutPlan[];
  cardio: ICardioPlan;
}

export interface IExercisePresetItem {
  _id?: string;
  exerciseId?: { name: string; linkToVideo: string; _id: string } | string;
  name: string;
  muscleGroup: string;
  exerciseMethod?: string;
  linkToVideo: string;
  imageUrl?: string;
  tipFromTrainer?: string;
}

export interface IMuscleGroupItem extends IBaseItem {}
export interface ICardioExerciseItem extends IBaseItem {}

export interface ISimpleCardioType {
  minsPerWeek: number;
  timesPerWeek: number;
  minsPerWorkout?: number;
  tips?: string;
}

export interface ICardioWorkout {
  name: string;
  warmUpAmount?: number;
  distance: string;
  cardioExercise: string;
  tips?: string;
}

export interface ICardioWeek {
  week: string;
  workouts: ICardioWorkout[];
}
export interface IComplexCardioType {
  weeks: ICardioWeek[];
  tips?: string;
}

export interface IExerciseMethod {
  title: string;
  description: string;
}
