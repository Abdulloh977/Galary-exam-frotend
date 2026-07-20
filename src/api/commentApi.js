import axiosInstance from "./axiosInstance";

export const createCommentApi = (data) => axiosInstance.post("/comment/create", data);

export const getPinCommentsApi = (pinId) =>
  axiosInstance.get(`/comment/pin/${pinId}`);

export const deleteCommentApi = (id) =>
  axiosInstance.delete(`/comment/delete/${id}`);

export const updateCommentApi = (id, text) =>
  axiosInstance.put(`/comment/update/${id}`, { text });
