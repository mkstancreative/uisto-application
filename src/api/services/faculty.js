import api from "../api";

export const getFaculties = async () => {
    const response = await api.get("/faculties/apiManageFaculties");
    return response.data;
  };
  
  export const createFaculty = async (data) => {
    const response = await api.post("/faculties/apiNewFaculty", data);
    return response.data;
  };
  
  export const updateFaculty = async (payload) => {
    const response = await api.post(`/faculties/apiUpdateFaculty`, payload);
    return response.data;
  };
  