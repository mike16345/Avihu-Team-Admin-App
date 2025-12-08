import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useLessonGroupsApi from "@/hooks/api/useLessonGroupsApi";
import { createRetryFunction, isUndefined } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useLessonGroupQuery = (id = "undefined") => {
  const { getLessonGroupById } = useLessonGroupsApi();

  return useQuery({
    queryKey: [QueryKeys.LESSON_GROUPS, id],
    staleTime: FULL_DAY_STALE_TIME,
    enabled: !isUndefined(id),
    queryFn: () => getLessonGroupById(id),
    retry: createRetryFunction(404, 2),
  });
};

export default useLessonGroupQuery;
