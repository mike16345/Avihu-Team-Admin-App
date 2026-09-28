import {
  type CreateSubTrainerBody,
  type SubTrainerPosition,
  type SubTrainerStatus,
  type TrainerId,
  type UpdateSubTrainerBody,
} from "@/interfaces/trainers";
import { z } from "zod";

export const SUB_TRAINER_POSITIONS = [
  "מאמן",
  "תזונאי",
  "יועץ תזונה",
  "אחר",
] as const satisfies readonly SubTrainerPosition[];
export const SUB_TRAINER_STATUSES = [
  "active",
  "inactive",
] as const satisfies readonly SubTrainerStatus[];

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

const subTrainerBaseSchema = z.object({
  fullName: z.string().min(2, { message: "אנא הכנס שם מלא" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  phone: z.string().regex(phoneRegex, { message: "אנא הכנס מספר טלפון תקין" }),
  position: z.enum(SUB_TRAINER_POSITIONS, {
    message: "בחר תפקיד",
  }),
  status: z.enum(SUB_TRAINER_STATUSES, {
    message: "בחר סטטוס",
  }),
});

export const createSubTrainerSchema = subTrainerBaseSchema.extend({
  password: z.string().min(1, { message: "אנא הכנס סיסמה" }),
});

export const updateSubTrainerSchema = subTrainerBaseSchema;

export type CreateSubTrainerSchemaType = z.infer<typeof createSubTrainerSchema>;
export type UpdateSubTrainerSchemaType = z.infer<typeof updateSubTrainerSchema>;

export const buildCreateSubTrainerPayload = (
  values: CreateSubTrainerSchemaType
): CreateSubTrainerBody => ({
  ...values,
  email: values.email.toLowerCase(),
});

export const buildUpdateSubTrainerPayload = (
  values: UpdateSubTrainerSchemaType
): UpdateSubTrainerBody => ({
  ...values,
  email: values.email.toLowerCase(),
});
