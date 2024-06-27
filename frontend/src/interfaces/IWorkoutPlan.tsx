export interface IWorkoutPlan {
  id?: string;
  userId?: string;
  name: string;
  workouts: IWorkout[];
}

export interface ISet {
  minReps: number;
  maxReps?: number;
  restTime: number;
}

export interface IWorkout {
  id: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
}
