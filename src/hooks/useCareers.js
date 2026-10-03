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

const noRetryOnClientError = (count, err) => !(err?.status >= 400 && err?.status < 500) && count < 2;

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
    retry: noRetryOnClientError,
  });

/* ── Applying ── */
export const useVerifyNin = () => useMutation({ mutationFn: verifyNin });

export const useSubmitApplication = () =>
  useMutation({
    mutationFn: ({ payload, onUploadProgress }) =>
      submitApplication(payload, { onUploadProgress }),
  });

/** Looks up one application; pass null to stay idle until the form is submitted. */
export const useApplicationStatus = (lookup) =>
  useQuery({
    enabled: Boolean(lookup?.applicationId && lookup?.email),
    queryKey: ['application-status', lookup?.applicationId, lookup?.email],
    queryFn: () => getApplicationStatus(lookup),
    retry: noRetryOnClientError,
    staleTime: 0,
  });

/* ── Magic links ── */
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
