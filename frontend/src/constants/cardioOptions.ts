import { IComplexCardioType, ISimpleCardioType } from "@/interfaces/IWorkoutPlan";

export const aerobicActivities = [
  { name: "הליכה מהירה", value: "הליכה מהירה" },
  { name: "ריצה קלה", value: "ריצה קלה" },
  { name: "אופניים", value: "אופניים" },
  { name: "אליפטיקל", value: "אליפטיקל" },
  { name: "מדרגות", value: "מדרגות" },
  { name: "קפיצה בחבל", value: "קפיצה בחבל" },
  { name: "הליכון", value: "הליכון" },
  { name: "שחייה", value: "שחייה" },
  { name: "כל פעילות אירובית בדופק קבוע", value: "כל פעילות אירובית בדופק קבוע" },
];

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
          distance: 2,
          cardioExercise: `הליכה מהירה`,
        },
      ],
    },
  ],
};
