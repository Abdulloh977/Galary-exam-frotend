import axiosInstance from "./axiosInstance";

export const signupApi = (data) => axiosInstance.post("/signup", data);

export const loginApi = (data) => axiosInstance.post("/login", data);
