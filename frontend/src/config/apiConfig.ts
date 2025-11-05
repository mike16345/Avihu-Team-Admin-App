import axios, { AxiosInstance } from "axios";

const SERVER = import.meta.env.VITE_SERVER_PREVIEW_URL || import.meta.env.VITE_SERVER;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 25000,
});

export default axiosInstance;
