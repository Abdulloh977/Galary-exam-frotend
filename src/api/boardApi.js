import axiosInstance from "./axiosInstance";

export const createBoardApi = (data) => axiosInstance.post("/board/create", data);

export const getMyBoardsApi = () => axiosInstance.get("/board/my");

export const getOneBoardApi = (id) => axiosInstance.get(`/board/one/${id}`);

export const updateBoardApi = (id, data) => axiosInstance.put(`/board/update/${id}`, data);

export const deleteBoardApi = (id) => axiosInstance.delete(`/board/delete/${id}`);

export const addPinToBoardApi = (data) => axiosInstance.put("/board/addPin", data);

export const saveBoardApi = (boardId) =>
  axiosInstance.put(`/board/save/${boardId}`);
