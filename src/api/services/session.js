import api from "../api";

export const getSessions = async () => {
  const response = await api.get("/sessions/apiManageSessions");
  return response.data;
};

export const createSession = async (data) => {
  const response = await api.post("/sessions/apiNewSession", data);
  return response.data;
};

export const updateSession = async (payload) => {
  const response = await api.post("/sessions/apiUpdateSession", payload);
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await api.delete(`/sessions/delete/${id}`);
  return response.data;
};
