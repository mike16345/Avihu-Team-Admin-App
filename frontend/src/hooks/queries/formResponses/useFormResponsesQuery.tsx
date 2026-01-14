import { useQuery } from "@tanstack/react-query";
import { HOUR_STALE_TIME } from "@/constants/constants";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { FormResponsesQueryParams, formResponsesKeys } from "./formResponsesKeys";

const useFormResponsesQuery = (params?: FormResponsesQueryParams) => {
  const { getFormResponses } = useFormResponsesApi();

  return useQuery({
    queryKey: formResponsesKeys.list(params),
    queryFn: () => getFormResponses(params),
    staleTime: HOUR_STALE_TIME,
  });
};

export default useFormResponsesQuery;
