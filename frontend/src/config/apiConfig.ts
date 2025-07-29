import axios, { AxiosInstance } from "axios";

const SERVER = import.meta.env.VITE_SERVER;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: SERVER,
  timeout: 20000,
});

export default axiosInstance;
