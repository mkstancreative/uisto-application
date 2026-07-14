import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeJobStatus, createJob, getJobById, getJobs, updateJob, getJobApplicants, getJobApplicantById, getJobApplicantStats, changeJobApplicantStatus, generateShortListCandidates, getShortListResultPerJob, getShortListedCandidatesPerJob, exportShortListedCandidatesPerJob, getJobRequirements, createJobRequirement, updateJobRequirement, deleteJobRequirement, updateJobRequirementStatus, getJobPositions, createJobPosition, updateJobPosition, deleteJobPosition, reorderJobPosition, getJobSubCadres, createJobSubCadre, updateJobSubCadre, deleteJobSubCadre, toggleJobSubCadreStatus, getAllShortListedCandidates } from "../api/services/Jobs";

export const useRequirements = (params) =>
    useQuery({
        queryKey: ["requirements", params],
        queryFn: () => getJobRequirements(params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useCreateRequirement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createJobRequirement,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["requirements"] }),
    });
};

export const useUpdateRequirement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateJobRequirement,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["requirements"] }),
    });
};

export const useDeleteRequirement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteJobRequirement,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["requirements"] }),
    });
};

export const useToggleRequirementStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateJobRequirementStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["requirements"] }),
    });
};

export const useSubCadres = (params) =>
    useQuery({
        queryKey: ["subCadres", params],
        queryFn: () => getJobSubCadres(params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useCreateSubCadre = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createJobSubCadre,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subCadres"] }),
    });
};

export const useUpdateSubCadre = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateJobSubCadre,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subCadres"] }),
    });
};

export const useDeleteSubCadre = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteJobSubCadre,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subCadres"] }),
    });
};

export const useToggleSubCadreStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: toggleJobSubCadreStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subCadres"] }),
    });
};

export const usePositions = (params) =>
    useQuery({
        queryKey: ["positions", params],
        queryFn: () => getJobPositions(params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useCreatePosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createJobPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["positions"] }),
    });
};

export const useUpdatePosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateJobPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["positions"] }),
    });
};

export const useReorderPosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: reorderJobPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["positions"] }),
    });
};

export const useDeletePosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteJobPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["positions"] }),
    });
};

/* ── All Jobs ── */
export const useJobs = (params) =>
    useQuery({
        queryKey: ["jobs", params],
        queryFn: () => getJobs(params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

/* ── Single Job ── */
export const useJobById = (id) =>
    useQuery({
        enabled: !!id,
        queryKey: ["job", id],
        queryFn: () => getJobById(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

/* ── Create ── */
export const useCreateJob = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createJob,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
    });
};

/* ── Update ── */
export const useUpdateJob = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateJob,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
    });
};

/* ── Toggle Status (isActive / isOpen) ── */
export const useChangeJobStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: changeJobStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
    });
};

/* ── Applications ── */
export const useJobApplicants = (params) =>
    useQuery({
        queryKey: ["applications", params],
        queryFn: () => getJobApplicants(params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useJobApplicantStats = () =>
    useQuery({
        queryKey: ["applications", "stats"],
        queryFn: getJobApplicantStats,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useJobApplicantById = (id) =>
    useQuery({
        enabled: !!id,
        queryKey: ["applications", id],
        queryFn: () => getJobApplicantById(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useChangeJobApplicantStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: changeJobApplicantStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
    });
};

export const useGenerateShortListCandidates = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: generateShortListCandidates,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
    });
};

export const useGetShortListResultPerJob = (id) =>
    useQuery({
        enabled: !!id,
        queryKey: ["shortlist", id],
        queryFn: () => getShortListResultPerJob(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useGetShortListedCandidatesPerJob = (id, params) =>
    useQuery({
        enabled: !!id,
        queryKey: ["shortlist", id, "candidates"],
        queryFn: () => getShortListedCandidatesPerJob(id, params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useExportShortListedCandidatesPerJob = () =>
    useMutation({
        mutationFn: ({ id, params }) => exportShortListedCandidatesPerJob(id, params),
    });

export const useGetAllShortListedCandidates = (params) =>
    useQuery({
        queryKey: ["shortlist", "all", params],
        queryFn: () => getAllShortListedCandidates(params),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
