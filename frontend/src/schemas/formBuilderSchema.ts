import { z } from "zod";

import { FormTypeOptions, QuestionTypeOptions, typesRequiringOptions } from "@/constants/form";
import ERROR_MESSAGES from "@/utils/errorMessages";

// Question Types Schema
export const QuestionTypesSchema = z.enum(
  QuestionTypeOptions.map((q) => q.value) as [
    (typeof QuestionTypeOptions)[number]["value"],
    ...string[],
  ]
);

// -----------------------------------------
// Form Question Schema (with conditional options)
export const FormQuestionSchema = z
  .object({
    type: QuestionTypesSchema,
    question: z
      .string({ message: ERROR_MESSAGES.required })
      .min(1, { message: ERROR_MESSAGES.required }),
    description: z.string().optional(),
    options: z.array(z.string()).optional(),
    required: z.boolean(),
  })
  .refine(
    (data) => {
      if (typesRequiringOptions.includes(data.type)) {
        return Array.isArray(data.options) && data.options.length > 0;
      }
      return true;
    },
    {
      message: ERROR_MESSAGES.arrayMin(1, "אופציה"),
      path: ["options"], // attach error to the options field
    }
  );

// -----------------------------------------
// Form Section Schema
export const FormSectionSchema = z.object({
  title: z.string().min(1, { message: ERROR_MESSAGES.required }),
  description: z.string().optional(),
  questions: z
    .array(FormQuestionSchema)
    .min(1, { message: ERROR_MESSAGES.arrayMinDetailed(1, "קטגוריה", "שאלה") }),
});

// -----------------------------------------
// Full Form Schema
export const FormSchema = z
  .object({
    name: z.string().min(1, { message: ERROR_MESSAGES.required }),
    type: z.enum(
      FormTypeOptions.map((f) => f.value) as [
        (typeof FormTypeOptions)[number]["value"],
        ...string[],
      ]
    ),
    showOn: z.coerce.date().optional(),
    repeatMonthly: z.boolean(),
    sections: z.array(FormSectionSchema).min(1, { message: ERROR_MESSAGES.arrayMin(1, "קטגוריה") }),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "general" && !data.showOn) {
      ctx.addIssue({
        path: ["showOn"],
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.required,
      });
    }
  });

// -----------------------------------------
// TypeScript types
export type FormQuestionType = z.infer<typeof FormQuestionSchema>;
export type FormSectionType = z.infer<typeof FormSectionSchema>;
export type FormType = z.infer<typeof FormSchema>;
