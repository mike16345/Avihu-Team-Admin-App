import {
  TRAINER_SOURCES,
  TRAINER_SUBSCRIPTION_PLANS,
  type CreateTrainerBody,
} from "@/interfaces/trainers";
import { z } from "zod";

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

export const trainerSchema = z.object({
  fullName: z.string().min(2, { message: "אנא הכנס שם מלא" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  phone: z.string().regex(phoneRegex, { message: "אנא הכנס מספר טלפון תקין" }),
  password: z.string().min(1, { message: "אנא הכנס סיסמה" }),
  subscriptionPlan: z.enum(TRAINER_SUBSCRIPTION_PLANS, {
    message: "בחר תוכנית",
  }),
  clientLimit: z.coerce.number().min(1, { message: "מינימום לקוחות הוא 1" }),
  subTrainerLimit: z.coerce.number().min(1, { message: "מינימום תתי מאמנים הוא 1" }),
  source: z.enum(TRAINER_SOURCES, {
    message: "בחר מקור הגעה",
  }),
  videoLibraryAccess: z.boolean(),
});

export type TrainerSchemaType = z.infer<typeof trainerSchema>;

export const buildCreateTrainerPayload = (values: TrainerSchemaType): CreateTrainerBody => ({
  ...values,
  email: values.email.toLowerCase(),
  status: "active",
});
