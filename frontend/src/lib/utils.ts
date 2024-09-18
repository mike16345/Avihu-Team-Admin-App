import { ApiResponse } from "@/types/types";
import { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export const convertStringsToOptions = (data: string[]) => {
  console.log("data", data);
  return data.map((item, index) => ({ value: item, label: item }));
};

export const handleAxiosError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with a status code outside of the 2xx range
    console.error(`Response Error \n Status code ${error.response.status}: `);
    console.error(error);

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
