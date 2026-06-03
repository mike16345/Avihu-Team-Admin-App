import {
  TRAINER_SOURCES,
  TRAINER_STATUSES,
  TRAINER_SUBSCRIPTION_PLANS,
  type CreateTrainerBody,
  type UpdateTrainerBody,
} from "@/interfaces/trainers";
import { z } from "zod";

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

const trainerBaseSchema = z.object({
  fullName: z.string().min(2, { message: "אנא הכנס שם מלא" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  phone: z.string().regex(phoneRegex, { message: "אנא הכנס מספר טלפון תקין" }),
  subscriptionPlan: z.enum(TRAINER_SUBSCRIPTION_PLANS, {
    message: "בחר תוכנית",
  }),
  clientLimit: z.coerce.number().min(1, { message: "מינימום לקוחות הוא 1" }),
  subTrainerLimit: z.coerce.number().min(1, { message: "מינימום תתי מאמנים הוא 1" }),
  status: z.enum(TRAINER_STATUSES, {
    message: "בחר סטטוס",
  }),
  source: z.enum(TRAINER_SOURCES, {
    message: "בחר מקור הגעה",
  }),
  videoLibraryAccess: z.boolean(),
});

export const trainerSchema = trainerBaseSchema.extend({
  password: z.string().min(1, { message: "אנא הכנס סיסמה" }),
});

export const updateTrainerSchema = trainerBaseSchema;

export type TrainerSchemaType = z.infer<typeof trainerSchema>;
export type UpdateTrainerSchemaType = z.infer<typeof updateTrainerSchema>;

export const buildCreateTrainerPayload = (values: TrainerSchemaType): CreateTrainerBody => ({
  ...values,
  email: values.email.toLowerCase(),
  status: "active",
});

export const buildUpdateTrainerPayload = (
  values: UpdateTrainerSchemaType
): UpdateTrainerBody => ({
  ...values,
  email: values.email.toLowerCase(),
});
