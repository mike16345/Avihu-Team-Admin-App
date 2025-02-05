export function cleanWorkoutObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanWorkoutObject(item));
  } else if (typeof obj === "object" && obj !== null) {
    const cleanedObject: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === "id" || key === "_id") {
          continue;
        } else if (key === "maxReps" && obj[key] === 0) {
          cleanedObject[key] = undefined;
        } else {
          cleanedObject[key] = cleanWorkoutObject(obj[key]);
        }
      }
    }
    return cleanedObject;
  } else {
    return obj;
  }
}

export const parseErrorFromObject = (errorObject: any) => {
  type HebrewPathTranslations = {
    workoutPlans: string;
    muscleGroups: string;
    exercises: string;
    sets: string;
    cardio:string;
    weeks:string;
    workouts:string;
  };

  // Type for customMessages object
  type CustomMessages = {
    minReps: string;
    maxReps: string;
    name: string;
    linkToVideo: string;
    muscleGroups: string;
    exercises: string;
    workoutPlans: string;
    minsPerWeek:string;
    timesPerWeek:string;
    distance:string
  };

  // Hebrew translations for path components
  const hebrewPathTranslations: HebrewPathTranslations = {
    workoutPlans: "אימון",
    muscleGroups: "קבוצת שריר",
    exercises: "תרגיל",
    sets: "סט",
    cardio:'אירובי',
    weeks:'שבוע',
    workouts:`אימון`
  };

  // Custom error messages for specific fields
  const customMessages: CustomMessages = {
    minReps: "כמות 'מינימום חזרות' אינה תקינה",
    maxReps: "כמות 'מקסימום חזרות' צריכה להיות גבוהה מכמות 'מינימום חזרות'",
    name: "לא נבחר שם לתרגיל",
    linkToVideo: "'לינק לסרטון' אינו לינק תקין",
    muscleGroups: "חסר קבוצת שריר", // Custom message for muscleGroups
    exercises: "חסר תרגיל", // Custom message for exercises
    workoutPlans: "חסר אימון",
    minsPerWeek:'חסר מספר דקות לשבוע',
    timesPerWeek:'חסר מספר אימונים בשבוע',
    distance:'חסר מרחק'
  };

  // Extract error message and path
  const errorMessage = errorObject.message;
  const pathRegex = /\"([^\"]+)\"/;
  const pathMatch = errorMessage.match(pathRegex);

  if (!pathMatch) {
    return "שגיאה לא ידועה";
  }

  const errorPath = pathMatch[1];

  // Match keys and indices from the error path
  const regex = /([a-zA-Z]+)|\[(\d+)\]/g;
  let match;
  const pathParts = [];
  const pathKeys = new Set(); // To track the keys we've already processed

  // Extract and build the path
  while ((match = regex.exec(errorPath)) !== null) {
    if (match[2]) {
      // Add 1-based index for array indices

      pathParts.push(Number(match[2]) + 1);
    } else if (match[1]) {
      // Translate keys into Hebrew, only if not already translated
      if (hebrewPathTranslations[match[1]] && !pathKeys.has(match[1])) {
        pathParts.push(hebrewPathTranslations[match[1]]);
        pathKeys.add(match[1]); // Mark this key as processed
      } else {
        pathParts.push(match[1]); // Add the key if no translation exists
      }
    }
  }

  // Build the readable Hebrew path
  let readablePath = "ב";
  let lastPart = ""; // To track the previous part for avoiding duplication
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];

    // Prevent duplicate parts (e.g., repeating "קבוצת שריר")
    if (part === lastPart) continue;

    if (typeof part === "number") {

      readablePath += `${part} `;
    } else if (i === pathParts.length - 1) {

      readablePath += ` `;
    } else if (typeof pathParts[i + 1] === "number") {

      readablePath += `${part} `;
    } else if(part=='plan'){

        readablePath += ` `
    } else {
      readablePath += `${part}, `;
    }

    lastPart = part; // Update the last part after each iteration
  }

  // Handle custom messages for specific fields
  const finalKey = errorPath.split(".").pop();

  // Check if the final key has a custom message
  if (customMessages[finalKey]) {
    if (finalKey == `workoutPlans`) return customMessages[finalKey];

    return `${readablePath.trim()}: ${customMessages[finalKey]}`;
  }

  // Default error message if no custom message is found
  return `${readablePath.trim()}: שגיאה`;
};
