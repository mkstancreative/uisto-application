import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  createPosition,
  createRequirement,
  createSubcadre,
  deletePosition,
  deleteRequirement,
  deleteSubcadre,
  getPosition,
  getPositions,
  getRequirements,
  getSubcadres,
  reorderPosition,
  toggleRequirement,
  toggleSubcadre,
  updatePosition,
  updateRequirement,
  updateSubcadre,
} from '../api/services/config';

export const CADRES = ['Academic', 'Non-Academic'];

const useConfigMutation = (mutationFn, key) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

/* ── Positions ── */
export const usePositions = (params) =>
  useQuery({
    queryKey: ['positions', 'list', params],
    queryFn: () => getPositions(params),
    placeholderData: keepPreviousData,
  });

/** Every position (limit omitted → unpaginated), for dropdowns. */
export const useAllPositions = () =>
  useQuery({
    queryKey: ['positions', 'list', 'all'],
    queryFn: () => getPositions({}),
    staleTime: 5 * 60 * 1000,
  });

export const usePosition = (id) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['positions', 'detail', id],
    queryFn: () => getPosition(id),
  });

export const useCreatePosition = () => useConfigMutation(createPosition, 'positions');
export const useUpdatePosition = () => useConfigMutation(updatePosition, 'positions');
export const useReorderPosition = () => useConfigMutation(reorderPosition, 'positions');
export const useDeletePosition = () => useConfigMutation(deletePosition, 'positions');

/* ── Requirements ── */
export const useRequirements = (params) =>
  useQuery({
    queryKey: ['requirements', 'list', params],
    queryFn: () => getRequirements(params),
    placeholderData: keepPreviousData,
  });

/** Requirements endpoint always paginates, so ask for a large page for pickers. */
export const useAllRequirements = (cadre) =>
  useQuery({
    queryKey: ['requirements', 'list', 'all', cadre ?? ''],
    queryFn: () => getRequirements({ page: 1, limit: 1000, cadre }),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateRequirement = () => useConfigMutation(createRequirement, 'requirements');
export const useUpdateRequirement = () => useConfigMutation(updateRequirement, 'requirements');
export const useToggleRequirement = () => useConfigMutation(toggleRequirement, 'requirements');
export const useDeleteRequirement = () => useConfigMutation(deleteRequirement, 'requirements');

/* ── Subcadres ── */
export const useSubcadres = (params) =>
  useQuery({
    queryKey: ['subcadres', 'list', params],
    queryFn: () => getSubcadres(params),
    placeholderData: keepPreviousData,
  });

export const useAllSubcadres = () =>
  useQuery({
    queryKey: ['subcadres', 'list', 'all'],
    queryFn: () => getSubcadres({}),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateSubcadre = () => useConfigMutation(createSubcadre, 'subcadres');
export const useUpdateSubcadre = () => useConfigMutation(updateSubcadre, 'subcadres');
export const useToggleSubcadre = () => useConfigMutation(toggleSubcadre, 'subcadres');
export const useDeleteSubcadre = () => useConfigMutation(deleteSubcadre, 'subcadres');
