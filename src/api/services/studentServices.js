import api from "../api";

export const getCourseStudent = async () => {
    const response = await api.get(`/subjects/apiGetCourses`);
    return response.data;
};

export const getSemesterStudent = async () => {
    const response = await api.get(`/semesters/apiGetSemesters`);
    return response.data;
};

export const getSessionStudent = async () => {
    const response = await api.get(`/sessions/apiGetSessions`);
    return response.data;
};

export const getLevelStudent = async () => {
    const response = await api.get(`/levels/apiGetLevels`);
    return response.data;
};


export const getAdmissionLetter = async () => {
    const response = await api.get(`/students/apiGetAcceptanceLetter`);
    return response.data;
};

export const getRegisteredCourses = async () => {
    const response = await api.get(`/students/apiMyCourses`);
    return response.data;
};

export const createRegisteredCourses = async (payload) => {
    const response = await api.post(`/courseregistrations/apiRegisterCourse`, payload);
    return response.data;
};

export const updateRegisteredCourses = async (payload) => {
    const response = await api.post(`/courseregistrations/apiEditCourseRegistration`, payload);
    return response.data;
};

export const deleteRegisteredCourses = async (payload) => {
    const response = await api.post(`/CourseregistrationsSubjects/apiDeleteStudentCourse`, payload);
    return response.data;
};

export const getCourseTopics = async (id) => {
    const response = await api.get(`/topics/apiViewCourseContent?subject_id=${id}`);
    return response.data;
};

export const getAssignments = async (id) => {
    const response = await api.get(`/assignments/apiCheckCourseAssignments?subject_id=${id}`);
    return response.data;
};

export const getAssignmentById = async (id) => {
    const response = await api.get(`/assignments/apiViewAssignment?id=${id}`);
    return response.data;
};

export const submitAssignment = async (payload) => {
    const response = await api.post(`/assignments/apiSubmitAssignment`, payload);
    return response.data;
};

export const createInitatePayment = async (payload) => {
    const response = await api.get(`/students/apiFeeSplit?invoice_id=${payload.invoice_id}&student_id=${payload.student_id}`);
    return response.data;
};

export const getMyInvoice = async () => {
    const response = await api.get(`/students/apiGetMyInVoices`);
    return response.data;
};

export const getMyReceipt = async (payload) => {
    const response = await api.get(`/invoices/apiGetReceipt?invoice_id=${payload.invoice_id}&student_id=${payload.student_id}`);
    return response.data;
};

export const payWithCredo = async (payload) => {
    const response = await api.get(
        `/students/apiGotoCredo?student_id=${payload.id}&fee_id=${payload.fee_id}&invoice_id=${payload.invoice_id}`,
    );
    return response.data;
};

export const goToRemita = async (payload) => {
    const response = await api.get(`/students/apiGoToRemita?order_id=${payload.order_id}&new_hash=${payload.new_hash}`);
    return response.data;
};

export const getMyResults = async (payload) => {
    const response = await api.post(`/results/apiMyResults`, payload);
    return response.data;
};

export const requestTranscript = async (payload) => {
    const response = await api.post(`/students/apiRequestTranscript`, payload);
    return response.data;
};

export const getLibrary = async (params) => {
    const response = await api.get(`/books/apiFindBooks`, { params });
    return response.data;
};

export const getELibrary = async (params) => {
    const response = await api.get(`/students/apiFindResources`, { params });
    return response.data;
};

export const downloadEbook = async (id) => {
    const response = await api.get(`/students/apiDownloadMaterial?id=${id}`);
    return response.data;
};

export const getElectionPostions = async () => {
    const response = await api.get(`/students/apiViewElection`);
    return response.data;
};

export const createElectionVotes = async (payload) => {
    const response = await api.post(`/students/apiVoteCandidate`, payload)
    return response.data;
}

export const getNotifications = async () => {
    const response = await api.get(`/notifications/apiGetNotices`);
    return response.data;
};

export const getStudentTimeTable = async () => {
    const response = await api.get(`/timetables/apiGetTimeTableForStudent`);
    return response.data;
};

export const getQuizStudent = async () => {
  const response = await api.get("/quizzes/apiMyQuizzes");
  return response.data;
};

export const getQuizStudentQuestion = async (id) => {
  const response = await api.get(`/quizzes/apiViewQuiz?quizid=${id}`);
  return response.data;
};

export const doQuiz = async ({ quizid, questionid, answer }) => {
  const response = await api.get(`/quizzes/apiSaveResponse?quizid=${quizid}&questionid=${questionid}&answer=${answer}`);
  return response.data;
};

export const finalizeQuiz = async ( quizid) => {
  const response = await api.get(`/quizzes/apiFinalizeQuiz?quizid=${quizid}`);
  return response.data;
};

export const getMyAdvisor = async () => {
  const response = await api.get(`/students/getMyAdvisor`);
  return response.data;
};

export const messageAdvisor = async (payload) => {
  // Matched Postman behavior: Form-Data POST body, variables in URL
  const response = await api.post(`/teachermessages/apiMessageTeacher`, new FormData(), {
    params: {
      teacher_id: payload.teacher_id,
      title: payload.title,
      message: payload.message
    }
  });
  return response.data;
};

export const readMyMessages = async () => {
  const response = await api.get(`/teachers/apiReadMessages`);
  return response.data;
};