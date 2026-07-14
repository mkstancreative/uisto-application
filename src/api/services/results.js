import api from "../api";

export const getResults = async (params) => {
    const response = await api.get("/results/apiManageresults", { params });
    return response.data;
};

export const getResultSpreadSheet = async (payload) => {
    const response = await api.post("/results/apiManageresults", payload);
    return response.data;
};

export const getAllTranscriptsOrders = async () => {
    const response = await api.get("/admins/apiManageTranscriptOrders");
    return response.data;
};

export const getTranscripts = async (id) => {
    const response = await api.get(`/results/apiManageTranscripts/${id}`);
    return response.data;
};

export const createResult = async (data) => {
    const formData = new FormData();

    // Append filter fields
    formData.append("faculty_id",    data.faculty_id    ?? "");
    formData.append("department_id", data.department_id ?? "");
    formData.append("subject_id",    data.subject_id    ?? "");
    formData.append("semester_id",   data.semester_id   ?? "");
    formData.append("session_id",    data.session_id    ?? "");
    formData.append("level_id",      data.level_id      ?? "");

    // Append the Excel file if present
    if (data.document) {
        formData.append("result", data.document);
    }

    const response = await api.post("/results/apiUploadResults", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const updateResult = async (payload) => {
    const response = await api.post(`/results/apiUpdateResult`, payload);
    return response.data;
};

export const deleteResult = async (payload) => {
    const response = await api.post(`/results/apiRemoveResult`, payload);
    return response.data;
};