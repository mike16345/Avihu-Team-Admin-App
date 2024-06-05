import axios, { AxiosInstance } from "axios";

const IP_ADDRESS = import.meta.env.VITE_SERVER_IP;
const PORT = import.meta.env.VITE_SERVER_PORT;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `http://${IP_ADDRESS}:${PORT}`,
  timeout: 10000,
});

export default axiosInstance;
