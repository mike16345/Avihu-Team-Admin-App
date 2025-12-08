import useLessonGroupsApi from "@/hooks/api/useLessonGroupsApi";
import { ILessonGroup } from "@/interfaces/IBlog";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useUpdateLessonGroup = ({
  onSuccess,
  onError,
}: IMutationProps<ApiResponse<ILessonGroup>>) => {
  const { updateLessonGroup } = useLessonGroupsApi();

  return useMutation({
    mutationFn: ({ id, group }: { id: string; group: ILessonGroup }) =>
      updateLessonGroup(id, group),
    onSuccess,
    onError,
  });
};

export default useUpdateLessonGroup;
