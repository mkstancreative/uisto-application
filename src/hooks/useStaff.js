import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  createStaffUser,
  deleteStaffUser,
  getStaffUser,
  getStaffUsers,
  resetStaffPassword,
  updateStaffUser,
} from '../api/services/staff';

const KEY = ['staff'];

export const useStaffUsers = (params) =>
  useQuery({
    queryKey: [...KEY, 'list', params],
    queryFn: () => getStaffUsers(params),
    placeholderData: keepPreviousData,
  });

export const useStaffUser = (id) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getStaffUser(id),
  });

const useStaffMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useCreateStaffUser = () => useStaffMutation(createStaffUser);
export const useUpdateStaffUser = () => useStaffMutation(updateStaffUser);
export const useResetStaffPassword = () => useStaffMutation(resetStaffPassword);
export const useDeleteStaffUser = () => useStaffMutation(deleteStaffUser);
