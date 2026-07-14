import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getForumDiscussions,
    createForumDiscussion,
    updateForumDiscussion,
    getForumDiscussionById,
    deleteForumDiscussion,
    createForumDiscussionComment,
} from "../api/services/general";

export const useGetForumDiscussions = () => {
    return useQuery({
        queryKey: ["forumDiscussions"],
        queryFn: getForumDiscussions,
    });
};

export const useCreateForumDiscussion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createForumDiscussion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forumDiscussions"] });
        },
    });
};

export const useUpdateForumDiscussion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateForumDiscussion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forumDiscussions"] });
        },
    });
};

export const useGetForumDiscussionById = (id) => {
    return useQuery({
        queryKey: ["forumDiscussion", id],
        queryFn: () => getForumDiscussionById(id),
        enabled: Boolean(id),
    });
};

export const useDeleteForumDiscussion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteForumDiscussion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forumDiscussions"] });
        },
    });
};

export const useCreateForumDiscussionComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ post_id, comment }) =>
      createForumDiscussionComment({ post_id, comment }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forumDiscussions"] });
      queryClient.invalidateQueries({
        queryKey: ["forumDiscussion", variables.post_id],
      });
    },
  });
};