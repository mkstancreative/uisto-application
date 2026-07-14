import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyProfile, loginUser } from "../api/services/auth";
import { useAuth } from "../hooks/useAuth";
import { normaliseUser, getPathForRoleId } from "../utils/rolePaths";
import { toast } from "react-toastify";

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      if (!response?.success) {
        toast.error(response?.message ?? "Login failed. Please try again.");
        return;
      }
      const data = response?.data;

      if (!data?.user) {
        toast.error("Invalid response from server. Please contact support.");
        return;
      }
      const normalisedUser = normaliseUser(data);

      login(normalisedUser, null);
      const dest = getPathForRoleId(normalisedUser.role_id);
      navigate(dest, { replace: true });
      toast.success(`Welcome back, ${normalisedUser.firstname}!`);
    },

    onError: (error) => {
      toast.error(
        error?.message ?? "Login failed. Please check your credentials."
      );
    },
  });
};

export const useMyProfile = () => {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["my-profile"], queryFn: getMyProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });
}