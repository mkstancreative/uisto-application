import api from "../api";

export const getCountries = async () => {
    const response = await api.get("/countries/apiGetCountries");
    return response.data;
};

export const getStates = async () => {
    const response = await api.get("/states/apiGetStates");
    return response.data;
};

export const getLgas = async () => {
    const response = await api.get("/lgas/apiGetLgas");
    return response.data;
};

export const getSystemLogs = async () => {
    const response = await api.get("/logs/apiLogs");
    return response.data;
};

export const getUserLogs = async (id) => {
    const response = await api.get(`/admins/apiViewActivityLogs?id=${id}`);
    return response.data;
};

export const getSystemSettings = async (id) => {
    const response = await api.get(`/settings/apiGetSettings?id=${id}`);
    return response.data;
};

export const updateSystemSettings = async ({ logos, ...fields }) => {
    const form = new FormData();
 
    Object.entries(fields).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
            form.append(key, val);
        }
    });
 
    if (logos instanceof File) {
        form.append("logos", logos);
    }

    const response = await api.post("/settings/apiEditSettings", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};
 
export const changePassword = async (data) => {
    const response = await api.put("/users/apiChangePassword", data);
    return response.data;
};