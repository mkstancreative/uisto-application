import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAssignedCourses,
    getCourseTopics,
    createCourseTopics,
    updateCourseTopics,
    getCourseRgisteredStudents,
    createUploadsResults,
    getAssignments,
    createAssignments,
    updateAssignments,
    getAssigmentById,
    deleteAssignment,
    getStudentResult,
    getAssignmentResponse,
    markAttendance,
    getAttendanceRecords,
    getAttendanceByDate,
    createQuestion,
    createQuiz,
    getQuiz,
    getTimeTable,
    updateQuiz,
    updateQuestion,
    getQuizAttempts,
    getViewQuizQuestion,
    deleteQuiz,
    createAIQuiz,
    getEnrolledStudents,
    messageStudent,
    getCoursesLecturer,
    getStudentLecturer,
    gradeAssignment,
} from "../api/services/lecturerServices";

export const useGetAssignedCourses = () => {
    return useQuery({
        queryKey: ["assignedCourses"],
        queryFn: getAssignedCourses,
    });
};

export const useGetCourseTopics = (subjectId) => {
    return useQuery({
        queryKey: ["lecturerCourseTopics", subjectId],
        queryFn: () => getCourseTopics({ subject_id: subjectId }),
        enabled: Boolean(subjectId),
        refetchOnWindowFocus: false,  
    });
};

export const useCreateCourseTopic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCourseTopics,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["lecturerCourseTopics"],
                exact: false,
            });
        },
    });
};

export const useUpdateCourseTopic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCourseTopics,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["lecturerCourseTopics"],
                exact: false,
            });
        },
    });
};

export const useGetCourseRegisteredStudents = (payload, options = {}) => {
    return useQuery({
        queryKey: ["courseRegisteredStudents", payload],
        queryFn: () => getCourseRgisteredStudents(payload),
        enabled: Boolean(payload?.subject_id),
        ...options,
    });
};

export const useGetAssignments = () => {
    return useQuery({
        queryKey: ["assignments"],
        queryFn: getAssignments,
    });
};

export const useCreateAssignments = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAssignments,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
        },
    });
};

export const useUpdateAssignments = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateAssignments,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
        },
    });
};

export const useGetAssigmentById = (payload) => {
    return useQuery({
        queryKey: ["assignment", payload.id],
        queryFn: () => getAssigmentById(payload),
        enabled: Boolean(payload.id),
    });
};

export const useGetAssignmentResponse = (id) => {
    return useQuery({
        queryKey: ["assignmentResponse", id],
        queryFn: () => getAssignmentResponse(id),
        enabled: Boolean(id),
    });
};

export const useGradeAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: gradeAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignmentResponse"] });
        },
    });
};

export const useDeleteAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
        },
    });
};

export const useCreateUploadResults = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUploadsResults,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courseRegisteredStudents"] });
        },
    });
};

export const useGetStudentResult = (payload, options = {}) => {
    return useQuery({
        queryKey: ["courseResults", payload],
        queryFn: () => getStudentResult(payload),
        enabled: Boolean(payload?.subject_id && payload?.session_id && payload?.semester_id),
        ...options,
    });
};

/* ── Attendance hooks ─────────────────────────── */
export const useMarkAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendanceRecords"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["attendanceByDate"], exact: false });
        },
    });
};

export const useGetAttendanceRecords = (payload, options = {}) => {
    return useQuery({
        queryKey: ["attendanceRecords", payload],
        queryFn: () => getAttendanceRecords(payload),
        enabled: Boolean(payload?.subject_id && payload?.session_id && payload?.semester_id),
        ...options,
    });
};

export const useGetAttendanceByDate = (payload, options = {}) => {
    return useQuery({
        queryKey: ["attendanceByDate", payload],
        queryFn: () => getAttendanceByDate(payload),
        enabled: Boolean(
            payload?.subject_id &&
            payload?.session_id &&
            payload?.semester_id &&
            payload?.attendance_date
        ),
        ...options,
    });
};

/* Fetch all attendance records for a course — takes just the subjectId */
export const useGetAttendanceBySubject = (subjectId) => {
    return useQuery({
        queryKey: ["attendanceRecords", subjectId],
        queryFn: () => getAttendanceRecords(subjectId),
        enabled: Boolean(subjectId),
    });
};

// Quiz __________________________________________________
export const useQuiz = (params) =>
    useQuery({
        queryKey: ["quiz", params],
        queryFn: () => getQuiz(params),
    });

export const useCreateQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createQuiz,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz"] }),
    });
};

export const useUpdateQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateQuiz,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz"] }),
    });
};

export const useDeleteQuiz = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteQuiz,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz"] }),
    });
};

export const useCreateQuestion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createQuestion,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quiz"] });
            qc.invalidateQueries({ queryKey: ["viewQuizQuestion"] });
        },
    });
};

export const useUpdateQuestion = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateQuestion,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quiz"] });
            qc.invalidateQueries({ queryKey: ["viewQuizQuestion"] });
        },
    });
};

export const useGetViewQuizQuestion = (id) => {
    return useQuery({
        queryKey: ["viewQuizQuestion", id],
        queryFn: () => getViewQuizQuestion(id),
        enabled: Boolean(id),
    });
};

export const useGetQuizAttempts = (id) => {
    return useQuery({
        queryKey: ["quizAttempts", id],
        queryFn: () => getQuizAttempts(id),
        enabled: Boolean(id),
    });
};

export const useTimeTable = () => {
    return useQuery({
        queryKey: ["timeTable"],
        queryFn: getTimeTable,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};

export const useCreateAIQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAIQuiz,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz"] }),
  });
};

export const useGetEnrolledStudents = (studentid, subjectid) => {
    return useQuery({
        queryKey: ["enrolledStudents", studentid, subjectid],
        queryFn: () => getEnrolledStudents(studentid, subjectid),
        enabled: Boolean(studentid && subjectid),
    });
};

export const useMessageStudent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: messageStudent,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["enrolledStudents"] }),
    });
};

export const useGetCoursesLecturer = () => {
    return useQuery({
        queryKey: ["coursesLecturer"],
        queryFn: getCoursesLecturer,
    });
};

export const useGetStudentLecturer = () => {
    return useQuery({
        queryKey: ["studentLecturer"],
        queryFn: getStudentLecturer,
    });
};


