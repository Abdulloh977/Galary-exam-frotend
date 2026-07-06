import axiosInstance from "./axiosInstance";

export const createBoardApi = (data) => axiosInstance.post("/board/create", data);

export const getOneBoardApi = (id) => axiosInstance.get(`/board/one/${id}`);

export const addPinToBoardApi = (data) => axiosInstance.put("/board/addPin", data);

export const saveBoardApi = (boardId) =>
  axiosInstance.put(`/board/save/${boardId}`);
