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
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const silent = originalRequest?.silent === true;

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post("/auth/refresh");

        const newAccessToken = response.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned");
        }

        localStorage.setItem(
          "auth_token",
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem("auth_token");

        const path = window.location.pathname;

        if (
          !path.startsWith("/login") &&
          !path.startsWith("/signup")
        ) {
          toast.error(
            "Session expired. Please sign in again."
          );

          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

   if (!silent && typeof window !== "undefined") {
  const msg =
    error?.response?.data?.message ||
    "Something went wrong. Please try again.";

  toast.error(msg);
}

    return Promise.reject(error);
  }
);

export default api;