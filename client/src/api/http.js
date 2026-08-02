import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const sanitizeData = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(sanitizeData);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeData(nestedValue)])
    );
  }

  return value;
};

export const http = axios.create({
  baseURL: API_BASE
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use((response) => {
  if (response?.data) {
    response.data = sanitizeData(response.data);
  }

  return response;
});
