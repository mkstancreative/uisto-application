import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  forgotPassword,
  getSessions,
  resetPassword,
  revokeSession,
} from '../api/services/auth';

/* Signed-in account actions that change auth state (profile, password,
   sign-out) live on the AuthProvider so the cached user stays in sync. */

export const useSessions = () =>
  useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: getSessions,
    staleTime: 30 * 1000,
  });

export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'sessions'] }),
  });
};

export const useForgotPassword = () => useMutation({ mutationFn: forgotPassword });

export const useResetPassword = () => useMutation({ mutationFn: resetPassword });
