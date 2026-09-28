export interface IMonthlyExerciseGoal {
  _id?: string;
  userId: string;
  exercise: string;
  targetWeight: number;
  targetReps: number;
  note?: string;
  setBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
