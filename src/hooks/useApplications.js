import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getApplication,
  getApplications,
  getReferenceSummary,
  getStatistics,
  updateApplicationStatus,
} from '../api/services/applications';

export const APPLICATION_STATUSES = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Not Shortlisted',
  'Rejected',
  'Interviewed',
  'Offered',
];

export const SHORTLIST_STATUSES = ['Pending', 'Auto-Shortlisted', 'Manual Review', 'Rejected'];

export const useApplications = (params) =>
  useQuery({
    queryKey: ['applications', 'list', params],
    queryFn: () => getApplications(params),
    placeholderData: keepPreviousData,
  });

export const useApplication = (id) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['applications', 'detail', id],
    queryFn: () => getApplication(id),
  });

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['statistics'] });
      qc.invalidateQueries({ queryKey: ['shortlist'] });
    },
  });
};

export const useStatistics = () =>
  useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics,
    staleTime: 60 * 1000,
  });

export const useReferenceSummary = () =>
  useQuery({
    queryKey: ['statistics', 'references'],
    queryFn: getReferenceSummary,
    staleTime: 60 * 1000,
  });
