import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSemester,
  getSemesters,
  updateSemester,
} from "../api/services/semester";

//   SEMESTERS
export const useSemesters = () => {
  return useQuery({
    queryKey: ["semesters"],
    queryFn: getSemesters,
  });
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
};
