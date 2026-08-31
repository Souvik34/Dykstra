/* eslint-disable prettier/prettier */
import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
baseURL: "https://api.dykstra.in/api/v1",
  withCredentials: true,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const silent = error?.config?.silent === true;

    if (typeof window !== "undefined" && status === 401) {
      localStorage.removeItem("auth_token");
      const path = window.location.pathname;

      if (!path.startsWith("/login") && !path.startsWith("/signup")) {
        toast.error("Session expired. Please sign in again.");
        window.location.replace("/login");
      }
    } else if (!silent && typeof window !== "undefined") {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";

      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;