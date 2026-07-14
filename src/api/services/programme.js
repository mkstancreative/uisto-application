import api from "../api";

export const getProgramme = async () => {
  const response = await api.get("/programes/apiManageProgrames");
  return response.data;
};

export const createProgramme = async (data) => {
  const response = await api.post("/programes/apiNewPrograme", data);
  return response.data;
};

export const updateProgramme = async (payload) => {
  const response = await api.post(`/programes/apiUpdatePrograme`, payload);
  return response.data;
};
