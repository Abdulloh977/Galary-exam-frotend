import axiosInstance from "./axiosInstance";

export const getConversationsApi = () => axiosInstance.get("/chat/conversations");

export const getConversationHistoryApi = (userId) =>
  axiosInstance.get(`/chat/${userId}`);

export const sendMessageApi = (data) => axiosInstance.post("/chat/send", data);
