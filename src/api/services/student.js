import api from "../api";

export const getStudents = async (params) => {
  const response = await api.get("/students/apiManageStudents", { params });
  return response.data;
};

export const getStudentsWithoutEmail = async (params) => {
  const response = await api.get("/students/apiStudentsWithoutEmail", { params });
  return response.data;
};

export const updateStudentEmail = async (payload) => {
  const response = await api.post(`/students/apiValidateEmail`, payload);
  return response.data;
};

export const updateStudent = async (payload) => {
  const isFormData = payload instanceof FormData;
  const response = await api.post(
    `/students/apiUpdateStudent`,
    payload,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
  );
  return response.data;
};

export const getNewApplicants = async (params) => {
  const response = await api.get("/students/apiManageApplicants", { params });
  return response.data;
};

export const createNewApplicant = async (payload) => {
  const response = await api.post("/students/apiNewApplicant", payload);
  return response.data;
};

export const updateApplicant = async (payload) => {
  const isFormData = payload instanceof FormData;
  const response = await api.post(
    `/students/apiUpdateApplicantData`,
    payload,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
  );
  return response.data;
};

export const updateStudentOlevel = async (payload) => {
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) body.append(k, v);
  });
  const response = await api.post(`/students/apiAdminUpdateOlevel`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

export const admitStudent = async (payload) => {
  const response = await api.post("/students/apiAdmitStudent", payload);
  return response.data;
};

export const promoteStudents = async (payload) => {
  const response = await api.post("/students/apiPromoteStudents", payload);
  return response.data;
};

export const importStudents = async (formData) => {
  const response = await api.post("/students/apiImportStudents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const checkAndRemoveEmail = async (payload) => {
  const response = await api.post("/users/apiCheckAndRemoveEmail", payload);
  return response.data;
};

export const assignRegNumber = async (payload) => {
  const response = await api.post("/students/apiAssignRegNo", payload);
  return response.data;
};


export const resetStudentPassword = async (payload) => {
  const response = await api.post(`/students/apiResetPassword`, payload)
  return response.data;
}