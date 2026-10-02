import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { createJob, getJob, getJobs, toggleJob, updateJob } from '../api/services/jobs';

export const useJobs = (params) =>
  useQuery({
    queryKey: ['jobs', 'list', params],
    queryFn: () => getJobs(params),
    placeholderData: keepPreviousData,
  });

/** Every job, for dropdowns (limit omitted returns all). */
export const useAllJobs = () =>
  useQuery({
    queryKey: ['jobs', 'list', 'all'],
    queryFn: () => getJobs({}),
    staleTime: 5 * 60 * 1000,
  });

export const useJob = (id) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['jobs', 'detail', id],
    queryFn: () => getJob(id),
  });

const useJobMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['careers'] });
    },
  });
};

export const useCreateJob = () => useJobMutation(createJob);
export const useUpdateJob = () => useJobMutation(updateJob);
export const useToggleJob = () => useJobMutation(toggleJob);

/** Display title for a job record from /jobs (position is populated). */
export const jobTitle = (job) =>
  job?.position?.title ?? job?.title ?? 'Untitled vacancy';
