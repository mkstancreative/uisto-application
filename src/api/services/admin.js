import api from "../api";

export const getAdmin = async () => {
    const response = await api.get("/users/apiManageAdmins");
    return response.data;
};

export const createAdmin = async (payload) => {
    const response = await api.post("/admins/apiAddAdmin", payload);
    return response.data;
};

export const updateAdmin = async (payload) => {
    const response = await api.post(`/users/apiUpdateAdminProfile`, payload);
    return response.data;
};

export const changeAdminStatus = async (payload) => {
    const response = await api.post(`/users/apiChangeUserStatus`, payload);
    return response.data;
};

export const getLecturer = async () => {
    const response = await api.get("/teachers/apiGetTeachers");
    return response.data;
};

export const getLecturerById = async (id) => {
    const response = await api.get(`/teachers/apiViewTeacher?id=${id}`);
    return response.data;
};

export const createLecturer = async (payload) => {
    const response = await api.post("/teachers/apiAddTeacher", payload);
    return response.data;
};

export const updateLecturer = async (payload) => {
    const response = await api.post(`/teachers/apiUpdateTeacher`, payload);
    return response.data;
};

export const changeLecturerStatus = async (payload) => {
    const response = await api.post(`/users/apiChangeUserStatus`, payload);
    return response.data;
};

export const deleteLecturer = async (payload) => {
    const response = await api.post(`/teachers/apiDeleteTeacher`, payload);
    return response.data;
};

