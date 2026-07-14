import api from "../api";

export const getCourses = async (params) => {
    const response = await api.get("/subjects/apiManageSubjects", { params });
    return response.data;
};

export const createCourse = async (data) => {
    const response = await api.post("/subjects/apiNewSubject", data);
    return response.data;
};

export const updateCourse = async (payload) => {
    const response = await api.post("/subjects/apiUpdateSubject", payload);
    return response.data;
};

export const getCourseTopics = async (id) => {
    const response = await api.get(`/topics/apiviewcontents?subject_id=${id}`);
    return response.data;
};

export const createCourseTopic = async (payload) => {
    const response = await api.post("/topics/apiaddTopic", payload);
    return response.data;
};

export const updateCourseTopic = async (payload) => {
    const response = await api.post("/topics/apiEditTopic", payload);
    return response.data;
};