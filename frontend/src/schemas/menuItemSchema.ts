import { z } from "zod";

const SERVING_TYPES_ERROR_MESSAGE = `שדה זה הינו שדה חובה`;
const LESS_THAN_ONE_ERROR_MESSAGE = `אנא הכנס מספר הגבוה מ-0`;

const servingItemSchema = z.object({
  spoons: z.coerce
    .number({ message: SERVING_TYPES_ERROR_MESSAGE })
    .positive({ message: LESS_THAN_ONE_ERROR_MESSAGE })
    .optional(),
  grams: z.coerce
    .number({ message: SERVING_TYPES_ERROR_MESSAGE })
    .positive({ message: LESS_THAN_ONE_ERROR_MESSAGE })
    .optional(),
  pieces: z.coerce
    .number({ message: SERVING_TYPES_ERROR_MESSAGE })
    .positive({ message: LESS_THAN_ONE_ERROR_MESSAGE })
    .optional(),
  cups: z.coerce
    .number({ message: SERVING_TYPES_ERROR_MESSAGE })
    .positive({ message: LESS_THAN_ONE_ERROR_MESSAGE })
    .optional(),
  scoops: z.coerce
    .number({ message: SERVING_TYPES_ERROR_MESSAGE })
    .positive({ message: LESS_THAN_ONE_ERROR_MESSAGE })
    .optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, { message: `חובה לתת לפריט שם` }),
  oneServing: servingItemSchema,
});
