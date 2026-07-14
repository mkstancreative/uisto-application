import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getLibrary,
    createLibraryBook,
    updateLibraryBook,
    deleteLibraryBook,
    getLoanedBooks,
    loanBook,
    returnedBooks,
    getEResources,
    createEResource,
    updateEResource,
    createMetaData,
    deleteEResource,
    collectLoanPenalty,
} from "../api/services/library";

export const useLibrary = (params) => {
    return useQuery({
        queryKey: ["library", params],
        queryFn: () => getLibrary(params),
        placeholderData: (prev) => prev,
    });
};

export const useCreateLibraryBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createLibraryBook,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library"] }),
    });
};

export const useUpdateLibraryBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateLibraryBook,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library"] }),
    });
};

export const useDeleteLibraryBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteLibraryBook,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library"] }),
    });
};

export const useLoanedBooks = (params) => {
    return useQuery({
        queryKey: ["loanedBooks", params],
        queryFn: () => getLoanedBooks(params),
        placeholderData: (prev) => prev,
    });
};

export const useLoanBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loanBook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library"] });
            queryClient.invalidateQueries({ queryKey: ["loanedBooks"] });
        },
    });
};

export const useReturnBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: returnedBooks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library"] });
            queryClient.invalidateQueries({ queryKey: ["loanedBooks"] });
        },
    });
};

export const useCollectLoanPenalty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: collectLoanPenalty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library"] });
            queryClient.invalidateQueries({ queryKey: ["loanedBooks"] });
        },
    });
};

export const useEResources = (params) => {
    return useQuery({
        queryKey: ["eResources", params],
        queryFn: () => getEResources(params),
        placeholderData: (prev) => prev,
    });
};

export const useCreateEResource = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEResource,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eResources"] }),
    });
};

export const useUpdateEResource = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateEResource,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eResources"] }),
    });
};

export const useCreateMetaData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMetaData,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eResources"] }),
    });
};

export const useDeleteEResource = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteEResource,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eResources"] }),
    });
};
