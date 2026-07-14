import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudents,
  getStudentsWithoutEmail,
  updateStudentEmail,
  updateStudent,
  createNewApplicant,
  getNewApplicants,
  checkAndRemoveEmail,
  updateStudentOlevel,
  admitStudent,
  promoteStudents,
  importStudents,
  updateApplicant,
  resetStudentPassword,
  assignRegNumber,
} from "../api/services/student";


export const useStudents = (params) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["newApplicants"] });
    },
  });
};

export const useStudentsWithoutEmail = (params) => {
  return useQuery({
    queryKey: ["studentsWithoutEmail", params],
    queryFn: () => getStudentsWithoutEmail(params),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateStudentEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudentEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["studentsWithoutEmail"] });
    },
  });
};

export const useUpdateStudentOlevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStudentOlevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["newApplicants"] });
    },
  });
};
export const useNewApplicants = (params) => {
  return useQuery({
    queryKey: ["newApplicants", params],
    queryFn: () => getNewApplicants(params),
    keepPreviousData: true,
    windowFocus: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};


export const useCreateApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newApplicants"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useAdmitStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: admitStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["newApplicants"] });
    },
    keepPreviousData: true,
    windowFocus: false,

  });
};

export const useCheckAndRemoveEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkAndRemoveEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["studentsWithoutEmail"] });
    },
  });
};

export const usePromoteStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoteStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useImportStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useAssignRegNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignRegNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useResetStudentPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetStudentPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    }
  })
}