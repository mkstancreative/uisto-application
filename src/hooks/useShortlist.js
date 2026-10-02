import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  exportShortlist,
  generateShortlist,
  getAllShortlistRuns,
  getJobShortlistRuns,
  getShortlistedCandidates,
} from '../api/services/shortlist';

export const AI_RECOMMENDATIONS = [
  'Strongly Recommended',
  'Recommended',
  'Marginally Recommended',
  'Not Recommended',
];

export const useGenerateShortlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateShortlist,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shortlist'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
};

export const useAllShortlistRuns = (params) =>
  useQuery({
    queryKey: ['shortlist', 'all', params],
    queryFn: () => getAllShortlistRuns(params),
    placeholderData: keepPreviousData,
  });

export const useJobShortlistRuns = (jobId, params) =>
  useQuery({
    enabled: Boolean(jobId),
    queryKey: ['shortlist', 'runs', jobId, params],
    queryFn: () => getJobShortlistRuns(jobId, params),
    placeholderData: keepPreviousData,
  });

export const useShortlistedCandidates = (jobId, params) =>
  useQuery({
    enabled: Boolean(jobId),
    queryKey: ['shortlist', 'candidates', jobId, params],
    queryFn: () => getShortlistedCandidates(jobId, params),
    placeholderData: keepPreviousData,
  });

export const useExportShortlist = () =>
  useMutation({ mutationFn: ({ jobId, params }) => exportShortlist(jobId, params) });
