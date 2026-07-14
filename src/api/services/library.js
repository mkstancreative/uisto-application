import api from "../api";

export const getLibrary = async (params) => {
    const response = await api.get("/books/apiGetBooks", { params });
    return response.data;
};

export const createLibraryBook = async (data) => {
    const response = await api.post("/books/apiAddNewBook", data);
    return response.data;
};

export const updateLibraryBook = async (payload) => {
    const response = await api.post(`/books/apiUpdateBook`, payload);
    return response.data;
};

export const deleteLibraryBook = async (id) => {
    const response = await api.post("/books/apiDeleteBook", id);
    return response.data;
};

export const getLoanedBooks = async (params) => {
    const response = await api.get("/loanedbooks/getAllLoaneActivities", { params });
    return response.data;
};

export const returnedBooks = async (payload) => {
    const response = await api.post(`/loanedbooks/apiReturnBook`, payload);
    return response.data;
};

export const loanBook = async (data) => {
    const response = await api.post("/loanedbooks/apiLoanOutBook", data);
    return response.data;
};

export const collectLoanPenalty = async (payload) => {
    const response = await api.post("/loanedbooks/apiCollectPenalty", payload);
    return response.data;
};

export const getEResources = async (params) => {
    const response = await api.get("/eresources/apiViewAllResources", { params });
    return response.data;
};

export const createEResource = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post(
        "/eresources/apiUploadResource",
        data,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    );
    return response.data;
};

export const updateEResource = async (payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.post(
        "/eresources/apiUpdateSinglEresource",
        payload,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    );
    return response.data;
};
export const createMetaData = async (data) => {
    const response = await api.post("/eresources/apiUploadMetadata", data);
    return response.data;
};


export const deleteEResource = async (id) => {
    const response = await api.post("/eresources/apiDeleteResource", id);
    return response.data;
};