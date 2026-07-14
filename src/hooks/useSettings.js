import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSystemLogs, getUserLogs, getSystemSettings, updateSystemSettings, changePassword, getCountries, getStates, getLgas } from "../api/services/settings";

export const useSystemLogs = () => {
    return useQuery({
        queryKey: ["system-logs"],
        queryFn: getSystemLogs,
    });
};

export const useUserLogs = (id, options = {}) => {
    return useQuery({
        queryKey: ["user-logs", id],
        queryFn: () => getUserLogs(id),
        enabled: id != null,
        ...options,
    });
};

export const useSystemSettings = (id = 1) => {
    return useQuery({
        queryKey: ["systemSettings", id],
        queryFn: () => getSystemSettings(id),
    });
};

export const useUpdateSystemSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSystemSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
        },
    });
};

export const useChangePassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
        },
    });
};

export const useCountries = () => {
    return useQuery({
        queryKey: ["countries"],
        queryFn: getCountries,
    });
};

export const useStates = () => {
    return useQuery({
        queryKey: ["states"],
        queryFn: getStates,
    });
};

export const useLgas = () => {
    return useQuery({
        queryKey: ["lgas"],
        queryFn: getLgas,
    });
};
