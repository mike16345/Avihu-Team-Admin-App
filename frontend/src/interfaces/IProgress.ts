export type ProgressOptions = 25 | 50 | 75 | 100;

export interface IProgressNote {
  _id?: string;
  date: Date;
  trainer: string;
  diet?: ProgressOptions;
  workouts?: ProgressOptions;
  cardio?: ProgressOptions;
  content: string;
}

export interface IProgressNotes {
  _id?: string;
  userId: string;
  progressNotes: IProgressNote[];
}
