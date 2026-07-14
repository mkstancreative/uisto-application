import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLectureHalls,
  createLectureHall,
  updateLectureHall,
  getAllTimeTable,
  getTimeTableById,
  createTimeTable,
  updateTimeTable,
  deleteTimeTable,
  createAttendence,
  getLectureHallsByID,
} from "../api/services/timetable";

export const useLectureHalls = () => {
    return useQuery({
        queryKey: ["lecture-halls"],
        queryFn: getLectureHalls,
    });
};

export const useCreateLectureHall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createLectureHall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lecture-halls"] });
        },
    });
};

export const useUpdateLectureHall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateLectureHall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lecture-halls"] });
        },
    });
};

export const useLectureHallsByID = (id) => {
    return useQuery({
        queryKey: ["lecture-halls-by-id", id],
        queryFn: () => getLectureHallsByID(id),
        enabled: !!id,
    });
};

export const useTimeTables = () => {
    return useQuery({
        queryKey: ["timetables"],
        queryFn: getAllTimeTable,
    });
};

export const useTimeTableById = (id) => {
    return useQuery({
        queryKey: ["timetable", id],
        queryFn: () => getTimeTableById(id),
        enabled: !!id,
    });
};

export const useCreateTimeTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTimeTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timetables"] });
        },
    });
};

export const useUpdateTimeTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTimeTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timetables"] });
        },
    });
};

export const useDeleteTimeTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTimeTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timetables"] });
        },
    });
};

export const useCreateAttendence = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAttendence,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendences"] });
        },
    });
};
