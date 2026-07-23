import axiosInstance from "./axiosInstance";

// Yangi pin yuklash — formData rasm fayli bilan birga yuboriladi
export const createPinApi = (formData) =>
  axiosInstance.post("/pin/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAllPinsApi = () => axiosInstance.get("/pin/all");

export const getTopPinsApi = () => axiosInstance.get("/pin/top");

export const searchPinsApi = (query) =>
  axiosInstance.get(`/pin/search?query=${encodeURIComponent(query)}`);

export const getOnePinApi = (id) => axiosInstance.get(`/pin/one/${id}`);

export const likePinApi = (id) => axiosInstance.put(`/pin/like/${id}`);

export const deletePinApi = (id) => axiosInstance.delete(`/pin/delete/${id}`);

export const updatePinApi = (id, data) => axiosInstance.put(`/pin/update/${id}`, data);

