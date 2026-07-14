import api from "../api";

export const getDepartments = async (params) => {
  const response = await api.get("/departments/apiManageDepartments", {params});
  return response.data;
};

export const getDepartmentById = async ({ id }) => {
  const response = await api.get(`/departments/apiViewDepartment`, { params: { id } });
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post("/departments/apiNewDepartment", data);
  return response.data;
};

export const updateDepartment = async (payload) => {
  const response = await api.post("/departments/apiUpdateDepartment", payload);
  return response.data;
};
