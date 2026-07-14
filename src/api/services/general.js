import api from "../api";

export const getForumDiscussions = async () => {
    const response = await api.get("/posts/apiGetAllPosts");
    return response.data;
};

export const createForumDiscussion = async (payload) => {
  const response = await api.post("/posts/apiAddNewPost", payload);
  return response.data;
};

export const updateForumDiscussion = async (payload) => {
  const response = await api.post("/posts/apiEditPost", payload);
  return response.data;
};

export const getForumDiscussionById = async (id) => {
    const response = await api.get(`/posts/apiViewPost?id=${id}`);
    return response.data;
};

export const deleteForumDiscussion = async (id) => {
    const response = await api.post(`/posts/apiDeletePost`, id);
    return response.data;
};

export const createForumDiscussionComment = async ({ post_id, comment }) => {
    const response = await api.post(`/comments/apiAddComment`, { post_id, comment });
    return response.data;
};