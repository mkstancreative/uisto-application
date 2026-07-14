import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  assignRoomToStudent,
  ejectStudent,
  ejectAllStudents,
} from '../api/services/hostels';

/* ─── HOSTELS ─────────────────────────────────────────── */
export const useHostels = () => {
  return useQuery({
    queryKey: ['hostels'],
    queryFn: getHostels,
  });
};

export const useCreateHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
};

export const useUpdateHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
};

export const useDeleteHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
};

/* ─── ROOMS ──────────────────────────────────────────── */
export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useAssignRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignRoomToStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useEjectStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ejectStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
export const useEjectAllStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ejectAllStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
