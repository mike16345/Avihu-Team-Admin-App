import { z } from "zod";

export const setSchema = z.object({
  minReps: z.number().min(1),
  maxReps: z.number().optional(),
});

export const workoutSchema = z.object({
  name: z.string().min(1),
  sets: z.array(setSchema).min(1),
  linkToVideo: z.string().optional(),
  tipFromTrainer: z.string().optional(),
  exerciseMethod: z.string().min(1).optional(),
});

export const muscleGroupWorkoutPlanSchema = z.object({
  muscleGroup: z.string().min(1),
  exercises: z.array(workoutSchema).min(1),
});

export const simpleCardioSchema = z.object({
  minsPerWeek: z.number().min(1),
  timesPerWeek: z.number().min(1),
  minsPerWorkout: z.number().min(1).optional(),
  tips: z.string().optional(),
});

export const cardioWorkoutSchema = z.object({
  name: z.string().min(1),
  warmUpAmount: z.number().min(0).optional(),
  distance: z.number().min(1),
  cardioExercise: z.string().min(1),
  tips: z.string().optional(),
});

export const cardioWeekSchema = z.object({
  week: z.string().min(1),
  workouts: z.array(cardioWorkoutSchema).min(1),
});

export const complexCardioSchema = z.object({
  weeks: z.array(cardioWeekSchema).min(1),
  tips: z.string().optional(),
});

export const cardioPlanSchema = z.object({
  type: z.enum(["simple", "complex"]),
  plan: z.union([simpleCardioSchema, complexCardioSchema]),
});

export const workoutPlanSchema = z.object({
  planName: z.string().min(1).max(25),
  muscleGroups: z.array(muscleGroupWorkoutPlanSchema).min(1),
});

export const fullWorkoutPlanSchema = z.object({
  tips: z.array(z.string()).optional(),
  workoutPlans: z.array(workoutPlanSchema).min(1),
  cardio: cardioPlanSchema,
});
