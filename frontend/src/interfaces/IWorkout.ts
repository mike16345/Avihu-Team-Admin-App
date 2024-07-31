import { WorkoutPlan } from "@/enums/WorkoutPlans";

export interface IRecordedSet {
  workoutPlan: WorkoutPlan;
  weight: number;
  repsDone: number;
  date: Date;
  note: string;
}

export interface IExerciseRecordedSets {
  [exercise: string]: IRecordedSet[];
}


export interface IMuscleGroupRecordedSets {
  userId: string;
  muscleGroup: string;
  recordedSets: IExerciseRecordedSets;
}
