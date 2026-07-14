import api from "../api";

export const getFees = async (params) => {
  const response = await api.get("/fees/apiGetFees", { params });
  return response.data;
};

export const createFee = async (payload) => {
  const response = await api.post("/fees/apiAddFee", payload);
  return response.data;
};

export const updateFee = async (payload) => {
  const response = await api.post("/fees/apiEditFee", payload);
  return response.data;
};


export const createAssignFeeToStudents = async (payload) => {
  const response = await api.post("/students/apiAssignFee", payload);
  return response.data;
};
