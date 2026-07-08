import axios from "axios";

// Backend serverimizning asosiy manzili
const BASE_URL = "http://localhost:4000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Har bir so'rovga avtomatik token qo'shib yuboradi (agar localStorage'da bo'lsa)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export default axiosInstance;
    