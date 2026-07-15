import axiosInstance from "./axiosInstance";

export const signupApi = (data) => axiosInstance.post("/signup", data);

export const loginApi = (data) => axiosInstance.post("/login", data);

// YANGI: Google tokenni backendga yuboradigan API funksiya
export const googleLoginApi = (data) => axiosInstance.post("/google-login", data);
