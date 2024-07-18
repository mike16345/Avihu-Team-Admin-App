import { z } from "zod";

const servingItemSchema = z.object({
    spoons: z.coerce.number({ message: `שדה זה הינו שדה חובה` }).positive({ message: `אנא הכנס מספר הגבוה מ-0` }),
    grams: z.coerce.number({ message: `שדה זה הינו שדה חובה` }).positive({ message: `אנא הכנס מספר הגבוה מ-0` })
})

export const menuItemSchema = z.object({
    itemName: z.string().min(1, { message: `חובה לתת לפריט שם` }),
    oneServing: servingItemSchema
})