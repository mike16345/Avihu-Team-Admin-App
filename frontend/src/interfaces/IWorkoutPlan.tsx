export interface IWorkoutPlan {
  _id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

export interface ICompleteWorkoutPlan {
  userId?: string;
  workoutPlans: IWorkoutPlan[];
  tips?: string[];
}

export interface ISet {
  _id?: string;
  minReps: number;
  maxReps?: number;
  restTime?: number;
}

export interface IExercise {
  _id?: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
}

export interface IMuscleGroupWorkouts {
  _id?: string;
  muscleGroup: string;
  exercises: IExercise[];
}

export interface IWorkoutPlanPreset {
  name: string;
  tips?: string[];
  workoutPlans: IWorkoutPlan[];
}

export interface IExercisePresetItem {
  name: string;
  muscleGroup: string;
  tipFromTrainer?: string;
  linkToVideo: string;
}
export interface IMuscleGroupItem {
  name: string;
}
