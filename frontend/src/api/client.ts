import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.warn("401 Unauthorized detected - clearing invalid access token.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("skin_ai_token");
      }
    }
    return Promise.reject(error);
  }
);

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function getValidImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://localhost:8000") || url.startsWith("http://127.0.0.1:8000")) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8000/, BACKEND_BASE_URL);
  }
  return url;
}


