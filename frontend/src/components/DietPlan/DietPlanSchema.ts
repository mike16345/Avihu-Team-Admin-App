import { z } from "zod";

const customInstructionsSchema = z.object({
  item: z.string(),
  quantity: z.number(),
});

const dietItemSchema = z.object({
  quantity: z.coerce.number().min(0, { message: "Quantity must be 0 or more." }),
  unit: z.enum(["grams", "spoons"]),
  customInstructions: z.array(customInstructionsSchema).optional(),
});

const mealSchema = z.object({
  totalProtein: dietItemSchema,
  totalCarbs: dietItemSchema,
  totalFats: dietItemSchema.optional(),
  totalVeggies: dietItemSchema.optional(),
});

export { mealSchema };
