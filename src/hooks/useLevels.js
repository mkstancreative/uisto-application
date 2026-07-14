import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLevel, getLevels, updateLevel } from "../api/services/level";

//   LEVELS
export const useLevels = () => {
  return useQuery({
    queryKey: ["levels"],
    queryFn: getLevels,
  });
};

export const useCreateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
    },
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
    },
  });
};
