import ERROR_MESSAGES from "@/utils/errorMessages";
import { z } from "zod";

export const presetNameSchema = z.object({
  name: z
    .string()
    .min(1, { message: `בחר שם לתפריט` })
    .max(100, { message: ERROR_MESSAGES.stringMax(100) }),
});

export type PresetNameSchemaType = z.infer<typeof presetNameSchema>;
