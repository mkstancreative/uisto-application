import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProgramme,
  getProgramme,
  updateProgramme,
} from "../api/services/programme";
//   ProgrammeS
export const useProgramme = () => {
  return useQuery({
    queryKey: ["Programme"],
    queryFn: getProgramme,
  });
};

export const useCreateProgramme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Programme"] });
    },
  });
};

export const useUpdateProgramme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Programme"] });
    },
  });
};
