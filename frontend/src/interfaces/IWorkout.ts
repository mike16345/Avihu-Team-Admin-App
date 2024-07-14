import { WorkoutPlan } from "@/enums/WorkoutPlans";

export interface IRecordedSet {
  workoutPlan: WorkoutPlan;
  weight: number;
  repsDone: number;
  date: Date;
  note: string;
}
