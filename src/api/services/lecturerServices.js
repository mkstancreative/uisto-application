import api from "../api";

export const getAssignedCourses = async () => {
    const response = await api.get(`/teachers/apiGetAssignedCourses`);
    return response.data;
};

export const getCourseTopics = async (payload) => {
    const response = await api.get(`/topics/apiteacherviewcontents?subject_id=${payload.subject_id}`);
    return response.data;
};

export const createCourseTopics = async (payload) => {
    const response = await api.post(`/teachers/apiAddTopic`, payload);
    return response.data;
};

export const updateCourseTopics = async (payload) => {
    const response = await api.post(`/teachers/apiUpdateTopic`, payload);
    return response.data;
};

export const getAssignments = async () => {
    const response = await api.get(`/setassignments/apiGetAssignments`);
    return response.data;
};

export const createAssignments = async (payload) => {
    const response = await api.post(`/setassignments/apiAddAssignment`, payload);
    return response.data;
};

export const updateAssignments = async (payload) => {
    const response = await api.post(`/setassignments/apiEditAssignment`, payload);
    return response.data;
};

export const getAssigmentById = async (payload) => {
    const response = await api.get(`/setassignments/apiGetAssignment?id=${payload.id}`);
    return response.data;
};

export const getAssignmentResponse = async (id) => {
    const response = await api.get(`/assignments/apiViewresponses?setassignment_id=${id}`);
    return response.data;
}

export const gradeAssignment = async (payload) => {
    const response = await api.post(`/assignments/apiGradeAssignment`, payload);
    return response.data;
}

export const deleteAssignment = async (payload) => {
    const response = await api.delete(`/Setassignments/apiDeleteAssignment?id=${payload.id}`);
    return response.data;
};

export const getCourseRgisteredStudents = async (payload) => {
    const response = await api.get(`/teachers/apiRegisteredStudents?semester_id=${payload.semester_id}&subject_id=${payload.subject_id}&level_id=${payload.level_id}`);
    return response.data;
};

export const createUploadsResults = async (formData) => {
    const response = await api.post(`/teachers/apiUploadResults`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getStudentResult = async (payload) => {
    const response = await api.post(`/teachers/apiViewTeacheriewcourseresults`, payload);
    return response.data;
};

/* ── Attendance ────────────────────────────────── */
export const markAttendance = async (payload) => {
    const response = await api.post(`/teachers/apiMarkAttendance`, payload);
    return response.data;
};

export const getAttendanceRecords = async (id) => {
    const response = await api.get(`/teachers/apiViewAttendace?subjectid=${id}`);
    return response.data;
};

export const getAttendanceByDate = async (payload) => {
    const response = await api.get(
        `/teachers/apiGetAttendanceByDate?subject_id=${payload.subject_id}&session_id=${payload.session_id}&semester_id=${payload.semester_id}&attendance_date=${payload.attendance_date}`
    );
    return response.data;
};

/* TimeTable __________________________________________________*/
export const getTimeTable = async () => {
    const response = await api.get(`/timetables/apiGetTimeTableForLecturer`);
    return response.data;
};

// Quiz __________________________________________________
export const getQuiz = async () => {
    const response = await api.get("/teachers/apiMyQuizes");
    return response.data;
};

export const createQuiz = async (data) => {
    const response = await api.post("/teachers/apiCreateQuiz", data);
    return response.data;
};

export const updateQuiz = async (data) => {
    const response = await api.post("/teachers/apiEditQuiz", data);
    return response.data;
};

export const deleteQuiz = async (payload) => {
    const response = await api.post(`/quizzes/apiDeleteQuiz`, payload);
    return response.data;
};

export const createQuestion = async (data) => {
    const response = await api.post("/teachers/apiAddQuestion", data);
    return response.data;
};

export const updateQuestion = async (payload) => {
    const response = await api.post(`/teachers/apiEditQuizQuestion`, payload);
    return response.data;
};

export const getViewQuizQuestion = async (id) => {
    const response = await api.get(`/teachers/apiViewQuizQuestions?quiz_id=${id}`);
    return response.data;
};

export const getQuizAttempts = async (id) => {
    const response = await api.get(`/teachers/apiViewQuizAttempts?quiz_id=${id}`);
    return response.data;
};

export const createAIQuiz = async (payload) => {
  const response = await api.post("/teachers/getQuestionAi", payload);
  return response.data;
};

export const getEnrolledStudents = async (studentid, subjectid) => {
    const response = await api.get(`/courseregistrations/apiGetStudentForCourse?studentid=${studentid}&subjectid=${subjectid}`);
    return response.data;
};

export const messageStudent = async (payload) => {
    const response = await api.post(`/teachers/apiMessageStudent`, payload);
    return response.data;
}

export const getCoursesLecturer = async () => {
    const response = await api.get(`/subjects/apiGetAllSubjects`);
    return response.data;
}

export const getStudentLecturer = async () => {
    const response = await api.get(`/students/apiGetAllStudents`);
    return response.data;
}