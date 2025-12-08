import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useLessonGroupsApi from "@/hooks/api/useLessonGroupsApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useLessonGroupsQuery = () => {
  const { getLessonGroups } = useLessonGroupsApi();

  return useQuery({
    queryKey: [QueryKeys.LESSON_GROUPS],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: getLessonGroups,
    retry: createRetryFunction(404, 2),
  });
};

export default useLessonGroupsQuery;
