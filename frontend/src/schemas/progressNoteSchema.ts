import { z } from "zod";

const REQUIRED_FIELD_MESSAGE = "שדה חובה";

export const ProgressOptions = z
  .union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)])
  .optional();

export const progressNoteSchema = z.object({
  date: z.date(),
  trainer: z.string({ message: REQUIRED_FIELD_MESSAGE }),
  content: z.string({ message: REQUIRED_FIELD_MESSAGE }),
  diet: ProgressOptions,
  workouts: ProgressOptions,
  cardio: ProgressOptions,
});
