export interface IWorkoutPlan {
  id?: string;
  userId?: string;
  name: string;
  workouts: IMuscleGroupWorkouts[];
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
  workoutsArr: IWorkout[]
}
