import { z } from "zod";

export const cardioWorkoutSchema = z.object({
  name: z.string().min(1, { message: `אנא בחר שם לשיטת ביצוע` }),
});
