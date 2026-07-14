import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSession,
  getSessions,
  updateSession,
} from "../api/services/session";

//   SESSIONS
export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};
