import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFaculty,
  getFaculties,
  updateFaculty,
} from "../api/services/faculty";

// FACULTIES
export const useFaculties = () => {
  return useQuery({
    queryKey: ["faculties"],
    queryFn: getFaculties,
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
};
