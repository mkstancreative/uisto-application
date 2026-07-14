import { careerApi } from "../api";

export const getJobRequirements = async (params) => {
    const response = await careerApi.get("requirements", { params });
    return response.data;
};

export const getJobRequirementsById = async (id) => {
    const response = await careerApi.get(`requirements/${id}`);
    return response.data;
};

export const createJobRequirement = async (payload) => {
    const response = await careerApi.post("requirements", payload);
    return response.data;
};

export const updateJobRequirement = async (payload) => {
    const { id, ...data } = payload;
    const response = await careerApi.put(`requirements/${id}`, data);
    return response.data;
};

export const updateJobRequirementStatus = async (payload) => {
    const { id } = payload;
    const response = await careerApi.patch(`requirements/${id}/toggle`);
    return response.data;
};

export const deleteJobRequirement = async (payload) => {
    const { id } = payload;
    const response = await careerApi.delete(`requirements/${id}`);
    return response.data;
};

export const getJobSubCadres = async (params) => {
    const response = await careerApi.get("subcadres", { params });
    return response.data;
};

export const createJobSubCadre = async (payload) => {
    const response = await careerApi.post("subcadres", payload);
    return response.data;
};

export const updateJobSubCadre = async (payload) => {
    const { id, ...data } = payload;
    const response = await careerApi.put(`subcadres/${id}`, data);
    return response.data;
};

export const deleteJobSubCadre = async (payload) => {
    const { id } = payload;
    const response = await careerApi.delete(`subcadres/${id}`);
    return response.data;
};

export const toggleJobSubCadreStatus = async (payload) => {
    const { id } = payload;
    const response = await careerApi.patch(`subcadres/${id}/toggle`);
    return response.data;
};

export const getJobPositions = async (params) => {
    const response = await careerApi.get("positions", { params });
    return response.data;
};

export const getJobPositionsById = async (id) => {
    const response = await careerApi.get(`positions/${id}`);
    return response.data;
};

export const createJobPosition = async (payload) => {
    const response = await careerApi.post("positions", payload);
    return response.data;
};

export const updateJobPosition = async (payload) => {
    const { id, ...data } = payload;
    const response = await careerApi.put(`positions/${id}`, data);
    return response.data;
};

export const reorderJobPosition = async (payload) => {
    const response = await careerApi.patch(`/positions/${payload.id}/reorder`, payload);
    return response.data;
};

export const deleteJobPosition = async (payload) => {
    const { id } = payload;
    const response = await careerApi.delete(`positions/${id}`);
    return response.data;
};

export const getJobs = async (params) => {
    const response = await careerApi.get("jobs", { params });
    return response.data;
};

export const getJobById = async (id) => {
    const response = await careerApi.get(`jobs/${id}`);
    return response.data;
};

export const createJob = async (payload) => {
    const response = await careerApi.post("jobs", payload);
    return response.data;
};

export const updateJob = async (payload) => {
    const { id, ...data } = payload;
    const response = await careerApi.put(`jobs/${id}`, data);
    return response.data;
};

export const changeJobStatus = async (payload) => {
    const { id } = payload;
    const response = await careerApi.patch(`jobs/${id}/close`);
    return response.data;
};

export const getJobApplicants = async (params) => {
    const response = await careerApi.get("/admin/applications", { params });
    return response.data;
};

export const getJobApplicantById = async (id) => {
    const response = await careerApi.get(`/admin/applications/${id}`);
    return response.data;
};

export const getJobApplicantStats = async () => {
    const response = await careerApi.get("/admin/statistics");
    return response.data;
};

export const changeJobApplicantStatus = async (payload) => {
    const { id, ...data } = payload;
    const response = await careerApi.patch(`/admin/applications/${id}/status`, data);
    return response.data;
};

export const generateShortListCandidates = async (payload) => {
    const response = await careerApi.post("/shortlist", payload);
    return response.data;
};
export const getShortListResultPerJob = async (id) => {
    const response = await careerApi.get(`/shortlist/${id}`);
    return response.data;
};

export const getShortListedCandidatesPerJob = async (id, params) => {
    const response = await careerApi.get(`/shortlist/${id}/candidates`, { params });
    return response.data;
};

export const getAllShortListedCandidates = async (params) => {
    const response = await careerApi.get(`/shortlist/all`, { params });
    return response.data;
};

export const exportShortListedCandidatesPerJob = async (id, params) => {
    const response = await careerApi.get(`/shortlist/${id}/export`, { params, responseType: "blob" });
    return response.data;
};