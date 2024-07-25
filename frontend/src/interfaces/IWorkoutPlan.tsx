export interface IWorkoutPlan {
  id?: string;
  userId?: string;
  planName: string;
  workouts: IMuscleGroupWorkouts[];
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

export interface IWorkout {
  id: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
}

export interface IMuscleGroupWorkouts {
  muscleGroup: string;
  exercises: IWorkout[]
}

export interface IWorkoutPlanPreset {
  presetName: string;
  workoutPlans: IWorkoutPlan[]
}

export interface IExercisePresetItem {
  itemName: string;
  muscleGroup: string;
  tipsFromTrainer?: string;
  linkToVideo: string;

}
export interface IMuscleGroupItem {
  itemName: string;
}
