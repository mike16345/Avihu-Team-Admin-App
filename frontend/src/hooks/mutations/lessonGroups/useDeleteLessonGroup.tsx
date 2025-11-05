import useLessonGroupsApi from "@/hooks/api/useLessonGroupsApi";
import { ILessonGroup } from "@/interfaces/IBlog";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useDeleteLessonGroup = ({
  onSuccess,
  onError,
}: IMutationProps<ApiResponse<ILessonGroup>>) => {
  const { deleteLessonGroup } = useLessonGroupsApi();

  return useMutation({
    mutationFn: deleteLessonGroup,
    onSuccess,
    onError,
  });
};

export default useDeleteLessonGroup;
