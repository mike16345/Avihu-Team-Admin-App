import {
  IComplexCardioType,
  ISimpleCardioType,
  IStepsCardioType,
} from "@/interfaces/IWorkoutPlan";

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

export const defaultStepsCardioOption: IStepsCardioType = {
  mode: "uniform",
  daily: 10000,
};

export const changeStepsCardioMode = (
  plan: IStepsCardioType,
  nextMode: IStepsCardioType["mode"]
): IStepsCardioType => {
  if (nextMode === "uniform") {
    const uniformPlan = { ...plan, mode: "uniform" as const };
    delete uniformPlan.perDay;
    return uniformPlan;
  }

  if (plan.perDay?.length === 7) {
    return { ...plan, mode: "custom" };
  }

  const fill = plan.daily ?? 10000;
  return {
    ...plan,
    mode: "custom",
    perDay: [fill, fill, fill, fill, fill, fill, 0],
  };
};
