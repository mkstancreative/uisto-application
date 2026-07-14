import api from "../api";

export const loginUser = async (credentials) => {
  const response = await api.post("/users/apiLogin", credentials);
  return response.data;
};

export const changePassword = async (credentials) => {
  const response = await api.post("/users/change-password", credentials);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/users/apiUserData");
  return response.data;
};
