import { getAccessToken } from "@/services/authSession";
import { LoginResponse, MeResponse, RefreshResponse } from "@/interfaces/IAuth";
import { API_KEY_HEADER, getApiKey } from "./apiKey";
import axios from "axios";
import { ApiResponse } from "@/types/types";

const SERVER = import.meta.env.VITE_SERVER_PREVIEW_URL || import.meta.env.VITE_SERVER;
const AUTH_ENDPOINT = "users/auth";

const authClient = axios.create({
  baseURL: SERVER,
  timeout: 25000,
});

authClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();

  if (apiKey && !config.headers[API_KEY_HEADER]) {
    config.headers[API_KEY_HEADER] = apiKey;
  }

  return config;
});

const unwrapAuthResponse = <T>(responseBody: T | ApiResponse<T>) => {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "data" in responseBody &&
    responseBody.data !== undefined
  ) {
    return responseBody.data as T;
  }

  return responseBody as T;
};

export const loginWithPassword = async (email: string, password: string) => {
  const response = await authClient.post<ApiResponse<LoginResponse> | LoginResponse>(
    `${AUTH_ENDPOINT}/login`,
    {
      email,
      password,
      isAdminApp: true,
    }
  );

  return unwrapAuthResponse<LoginResponse>(response.data);
};

export const requestPasswordResetOtp = async (email: string) => {
  const response = await authClient.post<ApiResponse<undefined>>("otp", {
    email,
  });

  return response.data;
};

export const validatePasswordResetOtp = async (email: string, otp: string) => {
  const response = await authClient.post<ApiResponse<{ changePasswordSessionId: string }>>(
    "otp/validate",
    {
      email,
      otp,
    }
  );

  return response.data;
};

export const changePasswordWithResetSession = async (
  email: string,
  password: string,
  sessionId: string
) => {
  const response = await authClient.put<ApiResponse<undefined>>("passwords", {
    email,
    sessionId,
    password,
  });

  return response.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await authClient.post<ApiResponse<RefreshResponse> | RefreshResponse>(
    `${AUTH_ENDPOINT}/refresh`,
    {
      refreshToken,
    }
  );

  return unwrapAuthResponse<RefreshResponse>(response.data);
};

export const logoutRefreshSession = async (refreshToken: string, accessTokenOverride?: string) => {
  const accessToken = accessTokenOverride ?? getAccessToken();

  await authClient.post(
    `${AUTH_ENDPOINT}/logout`,
    { refreshToken },
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined
  );
};

export const getCurrentAuthUser = async () => {
  const accessToken = getAccessToken();
  const response = await authClient.get<ApiResponse<MeResponse> | MeResponse>(
    `${AUTH_ENDPOINT}/me`,
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  return unwrapAuthResponse<MeResponse>(response.data);
};
