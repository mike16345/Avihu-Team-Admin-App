import axiosInstance from "@/config/apiConfig";
import { handleAxiosError } from "@/lib/utils";
import { AxiosRequestConfig, Method } from "axios";
import secureLocalStorage from "react-secure-storage";
import { USER_TOKEN_STORAGE_KEY } from "@/constants/constants";

const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

/**
 * Get the JWT access token from secureLocalStorage (saved on login).
 * Returns the Bearer token string, or empty string if not logged in.
 */
function getBearerToken(): string {
  try {
    const userToken = secureLocalStorage.getItem(USER_TOKEN_STORAGE_KEY) as any;
    if (!userToken || userToken === "undefined") return "";
    // Session is shaped { data: { token, user, ... } } based on backend
    const token =
      userToken?.data?.accessToken ||
      userToken?.data?.token ||
      userToken?.accessToken ||
      userToken?.token ||
      "";
    return token ? `Bearer ${token}` : "";
  } catch {
    return "";
  }
}

// Endpoints that must NOT receive Authorization Bearer (auth flows).
// Sending Bearer to these causes the server to fail validation (returns 500).
const SKIP_AUTH_PATHS = [
  "users/user/login",
  "users/user/session",
  "users/user/logout",
];

async function request<T>(
  method: Method,
  endpoint: string,
  data?: any,
  params?: any,
  headers?: any
): Promise<T> {
  const shouldSkipAuth = SKIP_AUTH_PATHS.some((p) => endpoint.includes(p));
  const authHeader = shouldSkipAuth ? "" : getBearerToken();
  const request: AxiosRequestConfig = {
    method,
    url: endpoint,
    data,
    params,
    headers: {
      ["X-Api-Key"]: API_AUTH_TOKEN,
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...headers,
    },
  };

  try {
    const response = await axiosInstance.request<T>(request);

    return response.data;
  } catch (error: any) {
    throw handleAxiosError(error);
  }
}

export async function fetchData<T>(endpoint: string, params?: any, headers?: any): Promise<T> {
  return request<T>("get", endpoint, undefined, params, headers);
}

export async function sendData<T>(
  endpoint: string,
  data: any,
  headers?: any,
  params?: any
): Promise<T> {
  return request<T>("post", endpoint, data, params, headers);
}

export async function updateItem<T>(
  endpoint: string,
  data: any,
  headers?: any,
  params?: any
): Promise<T> {
  return request<T>("put", endpoint, data, params, headers);
}

export async function patchItem<T>(endpoint: string, params?: any, headers?: any): Promise<T> {
  return request<T>("patch", endpoint, undefined, params, headers);
}

export async function deleteItem<T>(
  endpoint: string,
  params?: any,
  headers?: any,
  data?: any
): Promise<T> {
  return request<T>("delete", endpoint, data, params, headers);
}
