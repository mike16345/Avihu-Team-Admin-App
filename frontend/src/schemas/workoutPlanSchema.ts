import { z } from "zod";
import { youtubeLinkRegex } from "./exerciseSchema";
import ERROR_MESSAGES from "@/utils/errorMessages";

const MIN_REPS = 1;
const MIN_REST_TIME = 1;
const MIN_SETS = 1;
const MIN_WORKOUTS = 1;
const MIN_EXERCISES = 1;
const MIN_NAME_LENGTH = 1;
const MIN_TIME_PER_WEEK = 1;
const MIN_TIMES_PER_WEEK = 1;
const MIN_TIME_PER_WORKOUT = 1;
const MAX_PLAN_NAME_LENGTH = 75;
const MAX_REST_TIME = 300;
const CARDIO_TYPES = ["simple", "complex", "steps"];
const MIN_DAILY_STEPS = 1;
const MAX_DAILY_STEPS = 100000;
const PER_DAY_LENGTH = 7;

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
  name: z
    .string()
    .min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) })
    .optional(),
  sets: z.array(setSchema).min(MIN_SETS, { message: ERROR_MESSAGES.arrayMin(MIN_SETS, "סטים") }),
  exerciseId: z
    .string()
    .or(z.object({ name: z.string(), linkToVideo: z.string(), _id: z.string() })),
  linkToVideo: z
    .string()
    .regex(youtubeLinkRegex, { message: ERROR_MESSAGES.youtubeLink })
    .optional(),
  tipFromTrainer: z.string().optional(),
  exerciseMethod: z
    .string()
    .min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) })
    .optional(),
  restTime: z.coerce
    .number()
    .min(MIN_REST_TIME, { message: ERROR_MESSAGES.minNumber(MIN_REST_TIME) })
    .max(MAX_REST_TIME, { message: ERROR_MESSAGES.maxNumber(MAX_REST_TIME) }),
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

export const stepsCardioSchema = z.object({
  mode: z.enum(["uniform", "custom"]),
  daily: z.coerce
    .number()
    .min(MIN_DAILY_STEPS, { message: ERROR_MESSAGES.minNumber(MIN_DAILY_STEPS) })
    .max(MAX_DAILY_STEPS, { message: ERROR_MESSAGES.maxNumber(MAX_DAILY_STEPS) }),
  perDay: z
    .array(z.coerce.number().min(0).max(MAX_DAILY_STEPS))
    .length(PER_DAY_LENGTH)
    .optional(),
  tips: z.string().optional(),
});

export const cardioPlanSchema = z.object({
  type: z.enum(["simple", "complex", "steps"], {
    message: ERROR_MESSAGES.enumError(CARDIO_TYPES),
  }),
  plan: z.union([simpleCardioSchema, complexCardioSchema, stepsCardioSchema]),
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

/**
 * Optional metadata fields the trainer fills in when building a preset
 * or per-user workout plan. None of these are required so older presets
 * keep validating; they're surfaced in the UI as filter chips and tags.
 *
 * IMPORTANT: keep field names stable — the mobile Client-App must remain
 * agnostic to these fields (it does not read presets, but if the server
 * later mirrors them onto the per-user workoutPlan, ignoring unknown
 * fields is safer than depending on a specific shape).
 */
export const WORKOUT_LEVELS = ["beginner", "intermediate", "advanced", "pro"] as const;
export const WORKOUT_GOALS = [
  "fat-loss", // חיטוב
  "muscle-gain", // מסה
  "strength", // כוח
  "endurance", // סיבולת
  "toning", // חיזוק / טונוס
  "rehab", // שיקום
] as const;

export const WORKOUT_EQUIPMENT = [
  "gym", // חדר כושר מלא
  "studio", // סטודיו
  "weights", // משקולות (בית/חופשי)
  "bodyweight", // משקל גוף בלבד
  "weights-bodyweight", // משקולות + משקל גוף
] as const;

export const workoutMetaSchema = z.object({
  workoutsPerWeek: z.coerce.number().min(1).max(7).optional(),
  durationMinutes: z.coerce.number().min(10).max(240).optional(),
  level: z.enum(WORKOUT_LEVELS).optional(),
  goal: z.enum(WORKOUT_GOALS).optional(),
  equipment: z.enum(WORKOUT_EQUIPMENT).optional(),
  /**
   * Optional list of muscle-group focus tags. Trainers pick "full-body"
   * OR up to 3 specific groups. Stored as string slugs so the field is
   * agnostic to UI translations.
   */
  muscleFocus: z.array(z.string()).max(3).optional(),
  note: z.string().max(500).optional(),
  limitations: z.string().max(500).optional(),
  /** Sub-trainer (or main trainer) id of whoever built this plan. */
  builtByTrainerId: z.string().optional(),
});

export const fullWorkoutPlanSchema = z
  .object({
    tips: z
      .array(
        z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) })
      )
      .optional(),
    workoutPlans: z
      .array(workoutPlanSchema)
      .min(MIN_WORKOUTS, { message: ERROR_MESSAGES.arrayMin(MIN_WORKOUTS, "תכניות אימון") }),
    cardio: cardioPlanSchema,
  })
  .merge(workoutMetaSchema);

export const workoutPresetSchema = fullWorkoutPlanSchema.merge(
  z.object({
    name: z.string().min(MIN_NAME_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_NAME_LENGTH) }),
  })
);

export type WorkoutPresetSchemaType = z.infer<typeof workoutPresetSchema>;

export type WorkoutSchemaType = z.infer<typeof fullWorkoutPlanSchema>;
