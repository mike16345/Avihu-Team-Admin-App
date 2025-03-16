import { IComplexCardioType, ISimpleCardioType } from "@/interfaces/IWorkoutPlan";

export const defaultSimpleCardioOption: ISimpleCardioType = {
  minsPerWeek: 60,
  minsPerWorkout: 20,
  timesPerWeek: 3,
};

export const defaultComplexCardioOption: IComplexCardioType = {
  weeks: [
    {
      week: `שבוע 1`,
      workouts: [
        {
          name: `אימון 1`,
          warmUpAmount: 0,
          distance: '2 ק"מ',
          cardioExercise: `הליכה מהירה`,
        },
      ],
    },
  ],
};
