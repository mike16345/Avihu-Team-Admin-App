import { refreshAuthSession } from "@/services/authRefresh";
import { clearAuthSession, getAccessToken } from "@/services/authSession";
import { API_KEY_HEADER, getApiKey } from "@/services/apiKey";
import { shouldClearPersistedAuth } from "@/services/authErrors";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { attachAuthErrorInterceptor } from "./authInterceptor";

export const determineServerUrl = (): string => {
  return import.meta.env.VITE_SERVER_PREVIEW_URL || import.meta.env.VITE_SERVER;
};

const SERVER = determineServerUrl();

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 25000,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

attachAuthErrorInterceptor(axiosInstance);

axiosInstance.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  const accessToken = getAccessToken();

  if (apiKey && !config.headers[API_KEY_HEADER]) {
    config.headers[API_KEY_HEADER] = apiKey;
  }

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshAuthSession();

      const accessToken = getAccessToken();

      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return axiosInstance.request(originalRequest);
    } catch (refreshError) {
      if (shouldClearPersistedAuth(refreshError)) {
        clearAuthSession();
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
