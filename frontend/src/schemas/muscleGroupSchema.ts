import { z } from "zod";

export const muscleGroupSchema = z.object({
  name: z.string().min(1, { message: `אנא בחר שם לקבוצת השריר` }),
});
