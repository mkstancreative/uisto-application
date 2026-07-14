import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getResults,
    getTranscripts,
    createResult,
    updateResult,
    deleteResult,
    getResultSpreadSheet,
    getAllTranscriptsOrders,
} from "../api/services/results";

export const useResults = (params) => {
    return useQuery({
        queryKey: ["results", params],
        queryFn: () => getResults(params),
        placeholderData: (prev) => prev,
    });
};

export const useTranscriptsOrders = () => {
    return useQuery({
        queryKey: ["transcripts-orders"],
        queryFn: getAllTranscriptsOrders,
        placeholderData: (prev) => prev,
    });
};


export const useTranscripts = (studentId) => {
    return useQuery({
        queryKey: ["transcripts", studentId],
        queryFn: () => getTranscripts(studentId),
        enabled: Boolean(studentId),
    });
};

export const useCreateResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createResult,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["results"] });
        },
    });
};

export const useUpdateResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateResult,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["results"] });
        },
    });
};

export const useResultSpreadSheet = (payload, options = {}) => {
    return useQuery({
        queryKey: ["result-spreadsheet", payload],
        queryFn: () => getResultSpreadSheet(payload),
        placeholderData: (prev) => prev,
        enabled: options.enabled !== false,   // default true, but caller can pass false
        ...options,
    });
};

export const useDeleteResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteResult,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["results"] });
        },
    });
};
