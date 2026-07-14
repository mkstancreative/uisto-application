import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
} from "../api/services/departments";

//   DEPARTMENTS
export const useDepartments = (params) => {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => getDepartments(params),
    windowFocus: false,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

};

export const useDepartmentById = ({ id } = {}) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => getDepartmentById({ id }),
    enabled: Boolean(id),
  });
};


export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
