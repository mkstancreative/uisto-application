import api from "../api";

export const getTransactions = async (params) => {
    const response = await api.get("/transactions/apiGetAllTransactions", { params });
    return response.data;
};

export const deleteTransaction = async (payload) => {
    const response = await api.post("/transactions/deleteUnpaid", payload);
    return response.data;
};

export const getPaymentLogs = async (params) => {
    const response = await api.get("/Paylogs/apiGetAllPaylogs", { params });
    return response.data;
};

export const verifyRRR = async (payload) => {
    const response = await api.post("/admins/apiCheckrrr", payload);
    return response.data;
};

export const getUnpaidInvoices = async (params) => {
    const response = await api.get("/invoices/apiGetAllunpaidInvoices", { params });
    return response.data;
};

export const getStudentInvoices = async (id) => {
    const response = await api.get(`/invoices/apiGetInvoiceDetails/${id}`);
    return response.data;
};