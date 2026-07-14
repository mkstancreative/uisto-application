import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAdmissionModes,
    createAdmissionMode,
    updateAdmissionMode,
    deleteAdmissionMode,
    getAdmissionLetters,
    createAdmissionLetter,
    updateAdmissionLetter,
    deleteAdmissionLetter,
} from "../api/services/admissionMode";

export const useAdmissionModes = () => {
    return useQuery({
        queryKey: ["admissionModes"],
        queryFn: getAdmissionModes,
    });
};

export const useCreateAdmissionMode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdmissionMode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admissionModes"] });
        },
    });
};

export const useUpdateAdmissionMode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAdmissionMode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admissionModes"] });
        },
    });
};

export const useDeleteAdmissionMode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAdmissionMode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admissionModes"] });
        },
    });
};

export const useAdmissionLetters = () => {
    return useQuery({
        queryKey: ["admissionLetters"],
        queryFn: getAdmissionLetters,
    });
};

export const useCreateAdmissionLetter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdmissionLetter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admissionLetters"] });
        },
    });
};

export const useUpdateAdmissionLetter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAdmissionLetter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admissionLetters"] });
        },
    });
};

export const useDeleteAdmissionLetter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAdmissionLetter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admissionLetters"] });
        },
    });
};
