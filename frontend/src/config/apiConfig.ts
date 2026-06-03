import axios, { AxiosInstance } from "axios";
import secureLocalStorage from "react-secure-storage";
import { USER_TOKEN_STORAGE_KEY } from "@/constants/constants";

export const determineServerUrl = (): string => {
  return import.meta.env.VITE_SERVER_PREVIEW_URL || import.meta.env.VITE_SERVER;
};

const SERVER = determineServerUrl();

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 25000,
});

/**
 * Global 401 handler — when JWT expires anywhere in the app, clear the
 * stored token and bounce the user to /login so they re-authenticate.
 * Prevents getting stuck on screens with stale tokens.
 *
 * Skips session/login endpoints so we don't loop on the login screen itself.
 */
const AUTH_FLOW_PATHS = ["users/user/login", "users/user/session", "users/user/logout"];
let redirectingToLogin = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || "";
    const isAuthFlow = AUTH_FLOW_PATHS.some((p) => url.includes(p));

    if (status === 401 && !isAuthFlow && !redirectingToLogin) {
      redirectingToLogin = true;
      try {
        secureLocalStorage.removeItem(USER_TOKEN_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      // Avoid the redirect if we're already on login
      if (!window.location.pathname.includes("/login")) {
        window.location.replace("/login");
      } else {
        redirectingToLogin = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
