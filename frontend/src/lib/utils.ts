import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { IUser } from "@/interfaces/IUser";
import { Option } from "@/types/types";
import { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError, ZodIssue } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function updateTime() {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const newFormattedTime = `${formattedHours}:${formattedMinutes}`;
  return newFormattedTime;
}

export function getElapsedSeconds(timestamp: number) {
  // Check if timestamp is in milliseconds
  const isMilliseconds = timestamp > 10000000000;

  // Convert to seconds if needed
  const seconds = isMilliseconds ? Math.round(timestamp / 1000) : timestamp;

  const nowSeconds = Math.round(Date.now() / 1000);
  const elapsedSeconds = nowSeconds - seconds;

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ${remainingMinutes}m ${remainingSeconds.toFixed(0)}s`;
}

export const convertStringsToOptions = <T extends string>(
  data: T[],
  convertNameToLabel?: Function
): Option[] => {
  return data.map((item) => {
    const label = convertNameToLabel?.(item) || item;
    return { value: item, name: label };
  });
};

export const convertItemsToOptions = (
  data: any[],
  nameKey: string,
  valueKey: string | "this" = "this"
): Option[] => {
  return data.map((item) => {
    let val = valueKey == "this" ? item : item[valueKey];

    return {
      name: item[nameKey],
      value: val,
    };
  });
};

export const handleAxiosError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with a status code outside of the 2xx range
    console.error(`Response Error \n Status code ${error.response.status}: `, error);

    return error.response;
  } else if (error.request) {
    // Request was made but no response was received
    console.error("No Response:", error.request);
    return error.request;
  } else {
    // Something went wrong during setup of the request
    console.error("Request Setup Error:", error.message);
    return error.message;
  }
};

export const createRetryFunction = (ignoreStatusCode: number, maxRetries: number = 3) => {
  return (failureCount: number, error: any) => {
    console.log("error", error);
    // Check if error response exists and matches the ignored status code
    if (error?.status === ignoreStatusCode) {
      return false; // Stop retrying for the specified status code
    }
    // Retry up to the specified max retries for other errors
    return failureCount < maxRetries;
  };
};

export const buildPhotoUrls = (urls: string[]) => {
  return urls.map((url) => buildPhotoUrl(url));
};

export const buildPhotoUrl = (url: string) => {
  const cloudfrontUrl = import.meta.env.VITE_CLOUDFRONT_URL;

  return `${cloudfrontUrl}/images/${url}`;
};

export const servingTypeToString = (type: string) => {
  switch (type) {
    case "spoons":
      return "כפות";
    case "grams":
      return "גרם";
    case "pieces":
      return "חתיכות";
    case "scoops":
      return "סקופים";
    case "cups":
      return "כוסות";
    case "teaSpoons":
      return "כפיות";
    case "units":
      return "יחידות";
    default:
      return type;
  }
};

export function extractDateAndNumber(url: string) {
  const regex = /(\d{4}-\d{2}-\d{2})\/(\d+)/;
  const match = url.match(regex);

  if (match) {
    const date = match[1];
    const number = match[2];

    return { date, number };
  } else {
    throw new Error("Invalid URL format");
  }
}

export const extractVideoId = (url: string): string => {
  let videoId: string = "";

  // Check if URL contains ?v=
  if (url.includes("?v=")) {
    videoId = url.split("?v=")[1]?.split("&")[0];
  }
  // Check if it's a short YouTube URL
  else if (url.startsWith("https://youtu.be/")) {
    videoId = url.split("https://youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("/embed/")) {
    videoId = url.split("/embed/")[1]?.split("?")[0];
  } else if (url.includes("shorts/")) {
    videoId = url.split("shorts/")[1]?.split("?")[0];
  }

  return videoId;
};

export const getYouTubeThumbnail = (url: string) => {
  const id = extractVideoId(url);

  if (!id) {
    return ""; // or return a placeholder image URL
  }

  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  const clonedObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj as T;
};

const hebrewPathTranslations: Record<string, string> = {
  root: "",
  planName: "שם אימון",
  name: "שם",
  minReps: "מינימום חזרות",
  linkToVideo: "לינק לסרטון",
  maxReps: "מקסימום חזרות",
  workoutPlans: "אימון",
  muscleGroups: "קבוצת שריר",
  exercises: "תרגיל",
  sets: "סט",
  cardio: "אירובי",
  weeks: "שבוע",
  workouts: `אימון`,
  minsPerWeek: "כמות לשבוע",
  timesPerWeek: "פעמים בשבוע",
  warmUpAmount: "זמן חימום",
  freeCalories: "קלוריות חופשיות",
  totalProtein: "כמות חלבון",
  totalCarbs: "כמות פחמימות",
  totalFats: "כמות שומנים",
  totalVeggies: "כמות ירקות",
  quantity: "כמות",
  customItems: "בחירה מותאמת",
  extraItems: "פריטים נוספים",
  supplements: "תוספים",
};

export const getNestedError = (
  obj: Record<string, any>,
  key = "message",
  path: (string | number)[] = []
): { title: string; description: string } | null => {
  if (!obj || typeof obj !== "object") return null;

  if (key in obj) {
    return {
      title: `שגיאה ב- ${path.join(" ")}`,
      description: obj[key],
    };
  }

  for (const [k, value] of Object.entries(obj)) {
    if (typeof value === "object") {
      const formattedKey = isNaN(Number(k)) ? hebrewPathTranslations[k] : `${Number(k) + 1}`;
      const nestedError = getNestedError(value, key, [...path, `${formattedKey || ""}`]);
      if (nestedError) return nestedError;
    }
  }

  return null;
};

// Use for schema.safeParse()
export const getZodErrorIssues = (issues: ZodIssue[]) => {
  return issues.map((issue) => ({
    title:
      "שגיאה ב- " +
      issue.path
        .map(
          (key) => (typeof key === "string" ? hebrewPathTranslations[key] || key : key + 1) // Convert numbers to 1-based index
        )
        .join(" "),
    description: issue.message,
  }));
};

export const getNestedZodError = (error: ZodError) => {
  const { fieldErrors } = error.flatten();

  const firstField = Object.keys(fieldErrors)[0];

  if (firstField && fieldErrors[firstField]) {
    const translated = hebrewPathTranslations[firstField as any] || firstField;

    return {
      title: `שגיאה ב- ${translated}`,
      description: fieldErrors[firstField][0],
    };
  }

  return {
    title: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE,
    description: "",
  };
};

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
};

export const userFullName = (user: IUser) => {
  if (!user) return "";

  return user.firstName?.trim() + " " + user.lastName?.trim();
};

export function removePointerEventsFromBody() {
  if (document.body.style.pointerEvents === "none") {
    document.body.style.pointerEvents = "";
  }
}

export function isUndefined(variable: any) {
  return variable == undefined || variable == "undefined" || variable == null;
}

export const parseNumber = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return undefined;
  return Math.trunc(parsed);
};

export const normalizeValue = (value: ParamValue) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "boolean") return value ? "true" : "false";

  return String(value);
};

export type ParamValue = string | number | boolean | null | undefined;
