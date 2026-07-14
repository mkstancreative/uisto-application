import api from "../api";

export const getSemesters = async () => {
  const response = await api.get("/semesters/apiManageSemesters");
  return response.data;
};

export const createSemester = async (data) => {
  const response = await api.post("/semesters/apiNewSemesters", data);
  return response.data;
};

export const updateSemester = async (payload) => {
  const response = await api.post("/semesters/apiUpdateSemester", payload);
  return response.data;
};

export const deleteSemester = async (id) => {
  const response = await api.delete(`/semesters/delete/${id}`);
  return response.data;
};
