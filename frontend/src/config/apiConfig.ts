import axios, { AxiosInstance } from "axios";

export const determineServerUrl = (): string => {
  return import.meta.env.VITE_SERVER_PREVIEW_URL || import.meta.env.VITE_SERVER;
};

const SERVER = determineServerUrl();

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 25000,
});

export default axiosInstance;
