export interface IWorkoutPlan {
  id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

export interface ICompleteWorkoutPlan {
  userId?: string;
  workoutPlans: IWorkoutPlan[];
}

export interface ISet {
  id: number;
  minReps: number;
  maxReps?: number;
  restTime?: number;
}

export interface IExercise {
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
}

export interface IMuscleGroupWorkouts {
  muscleGroup: string;
  exercises: IExercise[];
}

export interface IWorkoutPlanPreset {
  name: string;
  workoutPlans: IWorkoutPlan[];
}

export interface IExercisePresetItem {
  name: string;
  muscleGroup: string;
  tipsFromTrainer?: string;
  linkToVideo: string;
}
export interface IMuscleGroupItem {
  name: string;
}
