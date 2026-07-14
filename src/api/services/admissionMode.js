import api from "../api";

export const getAdmissionModes = async () => {
    const response = await api.get("/modes/apiIndex");
    return response.data;
};

export const createAdmissionMode = async (data) => {
    const response = await api.post("/modes/apiIndex", data);
    return response.data;
};

export const updateAdmissionMode = async (payload) => {
    const response = await api.post("/modes/apiIndex", payload);
    return response.data;
};

export const deleteAdmissionMode = async (payload) => {
    const response = await api.post(`/modes/apiIndex`, payload);
    return response.data;
};

export const getAdmissionLetters = async () => {
    const response = await api.get("/letters/apiGetletters");
    return response.data;
};

export const createAdmissionLetter = async (data) => {
    const response = await api.post("/letters/apiAddLetter", data);
    return response.data;
};

export const updateAdmissionLetter = async (payload) => {
    const response = await api.post("/letters/apiEditLetter", payload);
    return response.data;
};

export const deleteAdmissionLetter = async (payload) => {
    const response = await api.post(`/letters/apiDeleteLetter`, payload);
    return response.data;
};