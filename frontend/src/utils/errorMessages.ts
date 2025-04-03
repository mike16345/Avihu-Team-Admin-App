const ERROR_MESSAGES = {
  minNumber: (min: number) => `המספר חייב להיות גדול או שווה ל-${min}`,
  maxNumber: (max: number) => `המספר חייב להיות קטן או שווה ל-${max}`,
  required: "שדה זה הינו חובה",
  stringMin: (min: number) => `הטקסט חייב להיות באורך של לפחות ${min} תווים`,
  stringMax: (max: number) => `הטקסט יכול להיות עד ${max} תווים בלבד`,
  arrayMin: (min: number, fieldName = "רשימה") => `${fieldName} צריכה להכיל לפחות ${min} פריטים`,
  enumError: (validValues: string[]) =>
    `ערך לא  חוקי. נא לבחור אחד מהבאים: ${validValues.join(", ")}`,
  youtubeLink:
    "הלינק חייב להיות לינק תקין של YouTube, לדוגמה: https://www.youtube.com/watch?v=videoId או https://youtu.be/videoId",
  maxReps: "מספר החזרות המקסימלי חייב להיות גדול ממספר החזרות המינימלי",
  noSpacesAllowed: "לא ניתן לשים רווחים בלבד",
};

export default ERROR_MESSAGES;
