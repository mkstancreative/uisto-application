import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getElection,
    getElectionPositions,
    createElectionPosition,
    updateElectionPosition,
    deleteElectionPosition,
    getCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getAdminViewVotes,
} from "../api/services/polls";


/* ─── Election ───────────────────────────────────────────── */
export const useElection = () =>
    useQuery({
        queryKey: ["election"],
        queryFn: getElection

    });

/* ─── Election Positions ─────────────────────────────────── */
export const useElectionPositions = () =>
    useQuery({ queryKey: ["electionPositions"], queryFn: getElectionPositions });

export const useCreateElectionPosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createElectionPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["electionPositions"] }),
    });
};

export const useUpdateElectionPosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateElectionPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["electionPositions"] }),
    });
};

export const useDeleteElectionPosition = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteElectionPosition,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["electionPositions"] }),
    });
};

/* ─── Candidates ─────────────────────────────────────────── */
export const useCandidates = () =>
    useQuery({ queryKey: ["candidates"], queryFn: getCandidates });

export const useCreateCandidate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCandidate,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
    });
};

export const useUpdateCandidate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCandidate,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
    });
};

export const useDeleteCandidate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCandidate,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["candidates"] });
        },
    });
};

/* ─── Admin View Votes ───────────────────────────────────── */
export const useAdminViewVotes = () =>
    useQuery({ queryKey: ["adminVotes"], queryFn: getAdminViewVotes });

