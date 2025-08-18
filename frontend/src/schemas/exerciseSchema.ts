import { z } from "zod";

export const youtubeLinkRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?#][^\s]*)?$/;

export const exerciseSchema = z.object({
  name: z.string().min(1, { message: `שם התרגיל חייב להיות תו אחד או יותר` }),
  muscleGroup: z.string().min(1, { message: `תרגיל חייב להיות משוייך לקבוצת שריר` }),
  linkToVideo: z.string().url({ message: `אנא הכנס לינק תקין!` }).regex(youtubeLinkRegex),
  imageUrl: z.string().optional(),
});
