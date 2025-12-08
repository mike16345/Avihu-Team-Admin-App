import useLessonGroupsApi from "@/hooks/api/useLessonGroupsApi";
import { ILessonGroup } from "@/interfaces/IBlog";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useAddLessonGroup = ({ onSuccess, onError }: IMutationProps<ApiResponse<ILessonGroup>>) => {
  const { createLessonGroup } = useLessonGroupsApi();

  return useMutation({
    mutationFn: createLessonGroup,
    onSuccess,
    onError,
  });
};

export default useAddLessonGroup;
