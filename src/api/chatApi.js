import axiosInstance from "./axiosInstance";

export const getConversationsApi = () => axiosInstance.get("/chat/conversations");

export const getConversationHistoryApi = (userId) =>
  axiosInstance.get(`/chat/${userId}`);

export const sendMessageApi = (data) => axiosInstance.post("/chat/send", data);

export const sendImageMessageApi = (formData) =>
  axiosInstance.post("/chat/send-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteMessageApi = (id) => axiosInstance.delete(`/chat/message/${id}`);
