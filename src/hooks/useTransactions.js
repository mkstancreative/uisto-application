import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactions, deleteTransaction, getPaymentLogs, getUnpaidInvoices, getStudentInvoices, verifyRRR } from "../api/services/transactions";

export const useTransactions = (params) => {
    return useQuery({
        queryKey: ["transactions", params],
        queryFn: () => getTransactions(params),
        placeholderData: (prev) => prev,
    });
};

export const usePaymentLogs = (params) => {
    return useQuery({
        queryKey: ["paymentLogs", params],
        queryFn: () => getPaymentLogs(params),
        placeholderData: (prev) => prev,
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries(["transactions"]);
        },
    });
};
export const useVerifyRRR = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => verifyRRR(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["paymentLogs"]);
            queryClient.invalidateQueries(["transactions"]);
            queryClient.invalidateQueries(["unpaidInvoices"]);
            queryClient.invalidateQueries(["studentInvoices"]);
        },
    });
};

export const useUnpaidInvoices = (params) => {
    return useQuery({
        queryKey: ["unpaidInvoices", params],
        queryFn: () => getUnpaidInvoices(params),
        placeholderData: (prev) => prev,
    });
};

export const useStudentInvoices = () => {
    return useQuery({
        queryKey: ["studentInvoices"],
        queryFn: getStudentInvoices,
    });
};
