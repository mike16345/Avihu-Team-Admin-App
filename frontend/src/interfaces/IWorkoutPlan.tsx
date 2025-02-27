export interface IWorkoutPlan {
  _id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

export interface ICompleteWorkoutPlan {
  userId?: string;
  workoutPlans: IWorkoutPlan[];
  cardio: ICardioPlan;
  tips?: string[];
}

export interface ICardioPlan {
  type: `simple` | `complex`;
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
  tipFromTrainer?: string;
  linkToVideo?: string;
  exerciseMethod?: string;
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
  cardio: ICardioPlan;
}

export interface IExercisePresetItem {
  name: string;
  muscleGroup: string;
  tipFromTrainer?: string;
  exerciseMethod?: string;
  linkToVideo: string;
}
export interface IMuscleGroupItem {
  name: string;
}

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
  exerciseMethod?: string;
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
