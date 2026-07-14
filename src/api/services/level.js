import api from "../api";


export const getLevels = async () => {
  const response = await api.get("/levels/apiManageClasses");
  return response.data;
};

export const createLevel = async (data) => {
  const response = await api.post("/levels/apiNewClass", data);
  return response.data;
};

export const updateLevel = async (payload) => {
  const response = await api.post("/levels/apiUpdateClass", payload);
  return response.data;
};
