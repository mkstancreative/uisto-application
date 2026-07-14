import api from "../api";

export const getNotifications = async () => {
    const response = await api.get("/notifications/apiGetNotices");
    return response.data;
};

export const createNotification = async (payload) => {
    const response = await api.post("/notifications/apiAddNotice", payload);
    return response.data;
};

export const updateNotification = async (payload) => {
    const response = await api.put(`/notifications/apiEditNotice`, payload);
    return response.data;
};

export const deleteNotification = async (payload) => {
    const response = await api.post(`/notifications/apiDeleteNotice`, payload);
    return response.data;
};