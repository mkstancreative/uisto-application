import api from "../api";

export const getLectureHalls = async () => {
    const response = await api.get("/lecturehalls/apiGetAllHalls");
    return response.data;
};

export const createLectureHall = async (data) => {
    const response = await api.post("/lecturehalls/apiAddHall", data);
    return response.data;
};

export const updateLectureHall = async ( data) => {
    const response = await api.post(`/lecturehalls/apiUpdateHall`, data);
    return response.data;
};

export const getLectureHallsByID = async (id) => {
    const response = await api.get(`/lecturehalls/apiGetHallDetails?id=${id}`);
    return response.data;
};

export const getAllTimeTable = async () => {
    const response = await api.get("/timetables/apiGetAllTimeTable");
    return response.data;
};


export const createTimeTable = async (data) => {
    const response = await api.post("/timetables/apiAddTimeTable", data);
    return response.data;
};

export const getTimeTableById = async (id) => {
    const response = await api.get(`/timetables/apiViewTimeTable?id=${id}`);
    return response.data;
};
export const updateTimeTable = async (data) => {
    const response = await api.post("/timetables/apiUpdateTimeTable", data);
    return response.data;
};

export const deleteTimeTable = async (data) => {
    const response = await api.post("/timetables/apiDeleteTimetable", data);
    return response.data;
};

export const getLecturerTimeTable = async () => {
    const response = await api.get("/apiGetLecturerTimeTable");
    return response.data;
};

export const createAttendence = async (id, data) => {
    const response = await api.post(`/teachers/apiMarkAttendance?subjectid=${id}`, data);
    return response.data;
};