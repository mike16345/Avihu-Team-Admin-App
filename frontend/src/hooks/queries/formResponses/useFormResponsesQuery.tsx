import { useQuery } from "@tanstack/react-query";
import { HOUR_STALE_TIME } from "@/constants/constants";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { FormResponsesQueryParams, formResponsesKeys } from "./formResponsesKeys";
import { useUsersStore } from "@/store/userStore";

const useFormResponsesQuery = (params?: FormResponsesQueryParams) => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";
  const { getFormResponses } = useFormResponsesApi();

  return useQuery({
    queryKey: formResponsesKeys.list(trainerId, params),
    queryFn: () => getFormResponses(params),
    staleTime: HOUR_STALE_TIME,
  });
};

export default useFormResponsesQuery;
