import api from "../api";

export const getHostels = async () => {
  const response = await api.get("/hostels/gethostels");
  return response.data;
};

export const createHostel = async (payload) => {
  const response = await api.post("/hostels/apiCreateHostel", payload);
  return response.data;
};

export const updateHostel = async (payload) => {
  const response = await api.post("/hostels/apiUpdateHostel", payload);
  return response.data;
};

export const deleteHostel = async (payload) => {
  const response = await api.post("/hostels/apiDeleteHostel", payload);
  return response.data;
};

export const getRooms = async () => {
  const response = await api.get("/hostelrooms/apigethostelrooms");
  return response.data;
};

export const createRoom = async (payload) => {
  const response = await api.post("/hostelrooms/apiCreateroom", payload);
  return response.data;
};

export const updateRoom = async (payload) => {
  const response = await api.post("/hostelrooms/apiEditroom", payload);
  return response.data;
};

export const deleteRoom = async (payload) => {
  const response = await api.post("/hostelrooms/apiDeleteHostelRoom", payload);
  return response.data;
};

export const assignRoomToStudent = async (payload) => {
  const response = await api.post("/hostelrooms/apiAssignRoomToStudent", payload);
  return response.data;
};

export const ejectStudent = async (payload) => {
  const response = await api.post("/hostelrooms/apiEjectStudent", payload);
  return response.data;
};

export const ejectAllStudents = async () => {
  const response = await api.delete("/hostelrooms/apiEjectAll");
  return response.data;
};