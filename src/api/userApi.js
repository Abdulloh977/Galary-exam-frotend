import axiosInstance from "./axiosInstance";

export const getProfileApi = (id) => axiosInstance.get(`/profile/${id}`);

export const getAllUsersApi = () => axiosInstance.get("/users");

export const getOneUserApi = (id) => axiosInstance.get(`/oneUser/${id}`);

// formData — ism, familiya, username, email, profilePicture (fayl)
export const updateProfileApi = (id, formData) =>
  axiosInstance.put(`/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteUserApi = (id) => axiosInstance.delete(`/delete/${id}`);
