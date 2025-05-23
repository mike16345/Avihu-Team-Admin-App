import axiosInstance from "@/config/apiConfig";
import { handleAxiosError } from "@/lib/utils";
import { AxiosRequestConfig, Method } from "axios";

const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

async function request<T>(
  method: Method,
  endpoint: string,
  data?: any,
  params?: any,
  headers?: any
): Promise<T> {
  const request: AxiosRequestConfig = {
    method,
    url: endpoint,
    data,
    params,
    headers: { ["X-Api-Key"]: API_AUTH_TOKEN, ...headers },
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
