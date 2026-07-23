import axiosInstance from "./axiosInstance";

export const getContactsApi = () => axiosInstance.get("/contact/list");

export const saveContactApi = (contactId) =>
  axiosInstance.post("/contact/save", { contactId });

export const removeContactApi = (contactId) =>
  axiosInstance.delete(`/contact/remove/${contactId}`);
