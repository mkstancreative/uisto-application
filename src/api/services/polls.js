import api from "../api";

export const getElection = async () => {
    const response = await api.get("/students/apiViewElection");
    return response.data;
};


export const getElectionPositions = async () => {
    const response = await api.get("/admins/apiGetPositions");
    return response.data;
};

export const createElectionPosition = async (data) => {
    const response = await api.post("/admins/apiAddPosition", data);
    return response.data;
};

export const updateElectionPosition = async (data) => {
    const response = await api.post("/admins/apiEditPosition", data);
    return response.data;
};

export const deleteElectionPosition = async (data) => {
    const response = await api.post("/positions/apiDeletePosition", data);
    return response.data;
};


export const getCandidates = async () => {
    const response = await api.get("/admins/apiManageCandidates");
    return response.data;
};

export const createCandidate = async (data) => {
    const response = await api.post("/admins/apiAddCandidate", data);
    return response.data;
};

export const updateCandidate = async (data) => {
    const response = await api.post("/admins/apiUpdateCandidate", data);
    return response.data;
};

export const deleteCandidate = async (data) => {
    const response = await api.post("/admins/apiDeleteCandidate", data);
    return response.data;
};

export const getAdminViewVotes = async () => {
    const response = await api.get("/admins/apiViewvotes");
    return response.data;
};

