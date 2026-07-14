import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, createNotification, updateNotification, deleteNotification } from "../api/services/notification";

export const useNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
    });
};

export const useCreateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNotification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
};

export const useUpdateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateNotification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
};
