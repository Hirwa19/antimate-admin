import api from "../api/axios";

export const createWorker = async (workerData) => {
  return api.post("/workers", workerData);
};

export const getWorkers = async () => {
  return api.get("/workers");
};

export const updateWorker = async (id, data) => {
  return api.put(`/workers/${id}`, data);
};

export const deleteWorker = async (id) => {
  return api.delete(`/workers/${id}`);
};