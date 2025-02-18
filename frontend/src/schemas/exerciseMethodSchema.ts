import { z } from "zod";

export const ExerciseMethodsSchema = z.object({
  title: z.string().min(1, { message: `אנא בחר שם לשיטת אימון` }),
  description: z.string().min(1, { message: `אנא הקלד תיאור לשיטת אימון` }),
});
