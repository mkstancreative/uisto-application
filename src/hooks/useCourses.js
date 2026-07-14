import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getCourses,
    createCourse,
    updateCourse,
    getCourseTopics,
    createCourseTopic,
    updateCourseTopic,
} from "../api/services/course";

export const useCourses = (params) => {
    return useQuery({
        queryKey: ["courses", params],
        queryFn: () => getCourses(params),
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};

export const useCourseTopics = (courseId) => {
    return useQuery({
        queryKey: ["courseTopics", courseId],
        queryFn: () => getCourseTopics(courseId),
        enabled: Boolean(courseId),
    });
};

export const useCreateCourseTopic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCourseTopic,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["courseTopics", String(variables.subject_id)] });
        },
    });
};

export const useUpdateCourseTopic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCourseTopic,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["courseTopics", String(variables.subject_id)] });
        },
    });
};
