import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdmissionLetter, getRegisteredCourses, createRegisteredCourses, updateRegisteredCourses, getCourseTopics, createInitatePayment, getMyInvoice, getMyReceipt, getMyResults, getNotifications, getLibrary, getELibrary, getElectionPostions, createElectionVotes, getCourseStudent, getSemesterStudent, getSessionStudent, getLevelStudent, getAssignments, getAssignmentById, submitAssignment, downloadEbook, deleteRegisteredCourses, requestTranscript, payWithCredo, goToRemita, getStudentTimeTable, getQuizStudent, getQuizStudentQuestion, doQuiz, finalizeQuiz, getMyAdvisor, messageAdvisor, readMyMessages } from "../api/services/studentServices";


export const useGetCourses = () => {
    return useQuery({
        queryKey: ["courses"],
        queryFn: getCourseStudent,
    });
};



export const useGetSemesters = () => {
    return useQuery({
        queryKey: ["semesters"],
        queryFn: getSemesterStudent,
    });
};

export const useGetSessions = () => {
    return useQuery({
        queryKey: ["sessions"],
        queryFn: getSessionStudent,
    });
};

export const useGetLevels = () => {
    return useQuery({
        queryKey: ["levels"],
        queryFn: getLevelStudent,
    });
};

export const useGetAdmissionLetter = () => {
    return useQuery({
        queryKey: ["admissionLetter"],
        queryFn: getAdmissionLetter,
    });
};

export const useGetRegisteredCourses = () => {
    return useQuery({
        queryKey: ["registeredCourses"],
        queryFn: getRegisteredCourses,
    });
};

export const useRequestTranscript = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: requestTranscript,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transcript"] });
        },
    });
};

export const useCreateRegisteredCourses = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRegisteredCourses,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["registeredCourses"] });
        },
    });
};

export const useUpdateRegisteredCourses = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRegisteredCourses,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["registeredCourses"], exact: false });
            queryClient.refetchQueries({ queryKey: ["registeredCourses"], exact: false });
        },
    });
};

export const useGetCourseTopics = (id) => {
    return useQuery({
        queryKey: ["courseTopics", id],
        queryFn: () => getCourseTopics(id),
    });
};

export const useGetAssignments = (id) => {
    return useQuery({
        queryKey: ["assignments", id],
        queryFn: () => getAssignments(id),
    });
};

export const useGetAssignmentById = (id) => {
    return useQuery({
        queryKey: ["assignment", id],
        queryFn: () => getAssignmentById(id),
    });
};

export const useSubmitAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: submitAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
        },
    });
};

export const useCreateInitatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createInitatePayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["initatePayment"] });
        },
    });
};

export const useGetMyInvoice = () => {
    return useQuery({
        queryKey: ["myInvoice"],
        queryFn: getMyInvoice,
    });
};

export const useGetMyReceipt = (payload, options = {}) => {
    return useQuery({
        queryKey: ["myReceipt", payload],
        queryFn: () => getMyReceipt(payload),
        enabled: Boolean(payload?.invoice_id),
        ...options,
    });
};

export const usePayWithCredo = (payload, options = {}) => {
    return useQuery({
        queryKey: ["payWithCredo", payload],
        queryFn: () => payWithCredo(payload),
        enabled: Boolean(payload?.invoice_id),
        ...options,
    });
}

export const useGoToRemita = (payload, options = {}) => {
    return useQuery({
        queryKey: ["goToRemita", payload],
        queryFn: () => goToRemita(payload),
        enabled: Boolean(payload?.order_id),
        ...options,
    });
}




export const useGetMyResults = () => {
    return useMutation({
        mutationFn: getMyResults,
    });
};

export const useGetElectionPostions = () => {
    return useQuery({
        queryKey: ["electionPostions"],
        queryFn: getElectionPostions,
    });
};

export const useCreateElectionVotes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createElectionVotes,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["electionPostions"] });
        },
    });
};

export const useGetLibrary = (params) => {
    return useQuery({
        queryKey: ["library", params],
        queryFn: () => getLibrary(params),
    });
};

export const useDownloadEbook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: downloadEbook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elibrary"] });
        },
    });
};

export const useGetELibrary = (params) => {
    return useQuery({
        queryKey: ["elibrary", params],
        queryFn: () => getELibrary(params),
    });
};

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
    });
};

export const useDeleteRegisteredCourses = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteRegisteredCourses,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["registeredCourses"] });
        },
    });
};

export const useGetStudentTimeTable = () => {
    return useQuery({
        queryKey: ["studentTimeTable"],
        queryFn: getStudentTimeTable,
    });
};

export const useGetQuizStudent = () => {
    return useQuery({
        queryKey: ["quizStudent"],
        queryFn: getQuizStudent,
    });
};

export const useGetQuizStudentQuestion = (id) => {
    return useQuery({
        queryKey: ["quizStudentQuestion", id],
        queryFn: () => getQuizStudentQuestion(id),
    });
};

export const useDoQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doQuiz,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quizStudentQuestion"] });
        },
    });
};

export const useFinalizeQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: finalizeQuiz,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quizStudentQuestion"] });
            queryClient.invalidateQueries({ queryKey: ["quizStudent"] });
        },
    });
};

export const useGetMyAdvisor = () => {
    return useQuery({
        queryKey: ["myAdvisor"],
        queryFn: getMyAdvisor,
    });
};

export const useMessageAdvisor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: messageAdvisor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myAdvisor"] });
        },
    });
};

export const useReadMyMessages = () => {
    return useQuery({
        queryKey: ["myMessages"],
        queryFn: readMyMessages,
    });
};