import { useMutation, useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getApplicationStatus,
  getOriginData,
  getRefereeForm,
  getVacancies,
  getVacancy,
  submitApplication,
  submitOriginData,
  submitReference,
  verifyNin,
} from '../api/services/careers';

/* ── Public vacancies ── */
export const useVacancies = (params) =>
  useQuery({
    queryKey: ['careers', 'list', params],
    queryFn: () => getVacancies(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

export const useVacancy = (jobId) =>
  useQuery({
    enabled: Boolean(jobId),
    queryKey: ['careers', 'detail', jobId],
    queryFn: () => getVacancy(jobId),
    retry: (count, err) => err?.status !== 404 && count < 2,
  });

/* ── Applying ── */
export const useVerifyNin = () => useMutation({ mutationFn: verifyNin });

export const useSubmitApplication = () =>
  useMutation({
    mutationFn: ({ payload, onUploadProgress }) =>
      submitApplication(payload, { onUploadProgress }),
  });

export const useApplicationStatus = () => useMutation({ mutationFn: getApplicationStatus });

/* ── Magic links ── */
const noRetryOnClientError = (count, err) => !(err?.status >= 400 && err?.status < 500) && count < 2;

export const useRefereeForm = (token) =>
  useQuery({
    enabled: Boolean(token),
    queryKey: ['referee', token],
    queryFn: () => getRefereeForm(token),
    retry: noRetryOnClientError,
  });

export const useSubmitReference = () => useMutation({ mutationFn: submitReference });

export const useOriginData = (token) =>
  useQuery({
    enabled: Boolean(token),
    queryKey: ['origin-data', token],
    queryFn: () => getOriginData(token),
    retry: noRetryOnClientError,
  });

export const useSubmitOriginData = () => useMutation({ mutationFn: submitOriginData });
