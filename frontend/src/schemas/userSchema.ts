import { z } from "zod";

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

const userSchema = z.object({
  firstName: z.string().min(2, { message: "אנא הכנס שם פרטי" }),
  lastName: z.string().min(2, { message: "אנא הכנס שם משפחה" }),
  phone: z.string().regex(phoneRegex, { message: "אנא הכנס מספר טלפון תקין" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  dateFinished: z.date({ message: "בחר תאריך סיום" }),
  planType: z.string().min(1, { message: "בחר סוג תוכנית" }),
  remindIn: z.coerce.number(),
  dietaryType: z.string().array().optional(),
});

export default userSchema;
