import { z } from "zod";

export const exerciseSchema = z.object({
    itemName: z.string().min(1, { message: `שם התרגיל חייב להיות תו אחד או יותר` }),
    muscleGroup: z.string().min(1, { message: `תרגיל חייב להיות משוייך לקבוצת שריר` }),
    tipsFromTrainer: z.string().min(1).optional(),
    linkToVideo: z.string().url({ message: `אנא הכנס לינק תקין!` })
})