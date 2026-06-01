import axios from "axios";

export const getAuthErrorStatus = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  if (error && typeof error === "object" && "status" in error) {
    return error.status;
  }

  return undefined;
};

export const shouldClearPersistedAuth = (error: unknown) => getAuthErrorStatus(error) === 401;
