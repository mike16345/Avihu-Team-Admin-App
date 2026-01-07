import { WorkoutPlan } from "@/enums/WorkoutPlans";

export interface IRecordedSet {
  plan: string;
  weight: number;
  repsDone: number;
  setNumber: number;
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
