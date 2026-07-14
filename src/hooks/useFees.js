import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getFees,
    createFee,
    updateFee,
    createAssignFeeToStudents,
} from "../api/services/fees";

export const useFees = (params) => {
    return useQuery({
        queryKey: ["fees", params],
        queryFn: () => getFees(params),
    });
};

export const useAddFee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createFee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fees"] });
        },
    });
};

export const useEditFee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateFee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fees"] });
        },
    });
};

export const useAssignFee = () => {
    // const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAssignFeeToStudents,
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ["fees"] });
        // },
    });
};
