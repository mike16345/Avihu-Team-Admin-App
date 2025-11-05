import ERROR_MESSAGES from "@/utils/errorMessages";
import z from "zod";

const MIN_LENGTH = 1;
const MAX_LENGTH = 75;
const MAX_DESCRIPTION_LENGTH = 150;

const lessonGroupSchema = z.object({
  name: z
    .string()
    .min(MIN_LENGTH, { message: ERROR_MESSAGES.stringMin(MIN_LENGTH) })
    .max(MAX_LENGTH, { message: ERROR_MESSAGES.stringMax(MAX_LENGTH) }),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, { message: ERROR_MESSAGES.stringMax(MAX_DESCRIPTION_LENGTH) })
    .optional(),
});

export type LessonGroupSchemaType = z.infer<typeof lessonGroupSchema>;

export default lessonGroupSchema;
