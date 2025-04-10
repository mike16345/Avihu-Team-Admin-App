import { z } from "zod";
import { youtubeLinkRegex } from "./exerciseSchema";
import ERROR_MESSAGES from "@/utils/errorMessages";

const MIN_REPS = 1;
const MIN_SETS = 1;
const MIN_WORKOUTS = 1;
const MIN_EXERCISES = 1;
const MIN_NAME_LENGTH = 1;
const MIN_TIME_PER_WEEK = 1;
const MIN_TIMES_PER_WEEK = 1;
const MIN_TIME_PER_WORKOUT = 1;
const MAX_PLAN_NAME_LENGTH = 75;
const CARDIO_TYPES = ["simple", "complex"];

export const setSchema = z
  .object({
    minReps: z.coerce.number().min(MIN_REPS, { message: ERROR_MESSAGES.minNumber(MIN_REPS) }),
    maxReps: z.coerce.number().optional(),
  })
  .refine(
    (data) =>
      typeof data.maxReps === "undefined" || data.maxReps == 0 ? true : data.maxReps > data.minReps,
    {
      message: ERROR_MESSAGES.maxReps,
      path: ["maxReps"],
    }
  );

export const workoutSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  sets: z.array(setSchema).min(MIN_SETS, { message: ERROR_MESSAGES.arrayMin(MIN_SETS, "סטים") }),
  linkToVideo: z.string().regex(youtubeLinkRegex, { message: ERROR_MESSAGES.youtubeLink }),
  tipFromTrainer: z.string().optional(),
  exerciseMethod: z
    .string()
    .min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) })
    .optional(),
});

export const muscleGroupWorkoutPlanSchema = z.object({
  muscleGroup: z
    .string()
    .min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  exercises: z
    .array(workoutSchema)
    .min(MIN_EXERCISES, { message: ERROR_MESSAGES.arrayMin(MIN_EXERCISES, "תרגילים") }),
});

export const simpleCardioSchema = z.object({
  minsPerWeek: z.coerce
    .number()
    .min(MIN_TIME_PER_WEEK, { message: ERROR_MESSAGES.minNumber(MIN_TIME_PER_WEEK) }),
  timesPerWeek: z.coerce
    .number()
    .min(MIN_TIMES_PER_WEEK, { message: ERROR_MESSAGES.minNumber(MIN_TIMES_PER_WEEK) }),
  minsPerWorkout: z
    .number()
    .min(MIN_TIME_PER_WORKOUT, { message: ERROR_MESSAGES.minNumber(MIN_TIME_PER_WORKOUT) })
    .optional(),
  tips: z.string().optional(),
});

export const cardioWorkoutSchema = z.object({
  name: z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  warmUpAmount: z.coerce
    .number()
    .min(0, { message: ERROR_MESSAGES.minNumber(0) })
    .optional(),
  distance: z.coerce.string().min(1, ERROR_MESSAGES.stringMin(1)),
  cardioExercise: z.coerce
    .string()
    .min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  tips: z.string().optional(),
});

export const cardioWeekSchema = z.object({
  week: z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  workouts: z
    .array(cardioWorkoutSchema)
    .min(MIN_EXERCISES, { message: ERROR_MESSAGES.arrayMin(MIN_EXERCISES, "אימונים") }),
});

export const complexCardioSchema = z.object({
  weeks: z
    .array(cardioWeekSchema)
    .min(MIN_SETS, { message: ERROR_MESSAGES.arrayMin(MIN_SETS, "שבועות") }),
  tips: z.string().optional(),
});

export const cardioPlanSchema = z.object({
  type: z.enum(["simple", "complex"], { message: ERROR_MESSAGES.enumError(CARDIO_TYPES) }),
  plan: z.union([simpleCardioSchema, complexCardioSchema]),
});

export const workoutPlanSchema = z.object({
  planName: z
    .string()
    .min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) })
    .max(MAX_PLAN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMax(MAX_PLAN_NAME_LENGTH) }),
  muscleGroups: z
    .array(muscleGroupWorkoutPlanSchema)
    .min(MIN_EXERCISES, { message: ERROR_MESSAGES.arrayMin(MIN_EXERCISES, "קבוצות שרירים") }),
});

export const fullWorkoutPlanSchema = z.object({
  tips: z
    .array(z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }))
    .optional(),
  workoutPlans: z
    .array(workoutPlanSchema)
    .min(MIN_WORKOUTS, { message: ERROR_MESSAGES.arrayMin(MIN_WORKOUTS, "תכניות אימון") }),
  cardio: cardioPlanSchema,
});

export const workoutPresetSchema = fullWorkoutPlanSchema.merge(
  z.object({
    name: z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  })
);

export type WorkoutPresetSchemaType = z.infer<typeof workoutPresetSchema>;

export type WorkoutSchemaType = z.infer<typeof fullWorkoutPlanSchema>;
