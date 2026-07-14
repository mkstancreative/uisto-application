import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAdmin, createAdmin, updateAdmin, changeAdminStatus,
    getLecturer, createLecturer, updateLecturer, changeLecturerStatus, deleteLecturer,
    getLecturerById,
} from "../api/services/admin";



/* ── Admins ── */
export const useAdmins = () => {
    const qc = useQueryClient();
    return useQuery({
        queryKey: ["admins"], queryFn: getAdmin,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
    });
}

export const useCreateAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createAdmin,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
    });
};

export const useUpdateAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateAdmin,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
    });
};

export const useChangeAdminStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: changeAdminStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
    });
};

/* ── Lecturers ── */
export const useLecturers = () => {
    const qc = useQueryClient();
    return useQuery({
        queryKey: ["lecturers"], queryFn: getLecturer,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["lecturers"] }),
    });
}

export const useLecturerById = (id) =>
    useQuery({
        enabled: !!id,
        queryKey: ["lecturer", id],
        queryFn: () => getLecturerById(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

export const useCreateLecturer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createLecturer,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["lecturers"] }),
    });
};

export const useUpdateLecturer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateLecturer,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["lecturers"] }),
    });
};

export const useChangeLecturerStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: changeLecturerStatus,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["lecturers"] }),
    });
};

export const useDeleteLecturer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteLecturer,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["lecturers"] }),
    });
};
