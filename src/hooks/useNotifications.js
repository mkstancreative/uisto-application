import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createNotification,
    deleteNotification,
    getNotifications,
    updateNotification,
} from "../api/services/notification";

//   NOTIFICATIONS
export const useNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useUpdateNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};