import { useQuery } from "@tanstack/react-query";
import { HOUR_STALE_TIME } from "@/constants/constants";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { formResponsesKeys } from "./formResponsesKeys";
import { useUsersStore } from "@/store/userStore";

const useFormResponseQuery = (responseId?: string, enabled = true) => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";

  const { getFormResponseById } = useFormResponsesApi();

  return useQuery({
    queryKey: formResponsesKeys.one(responseId, trainerId),
    enabled: Boolean(responseId) && enabled,
    queryFn: () => getFormResponseById(responseId!),
    staleTime: HOUR_STALE_TIME,
  });
};

export default useFormResponseQuery;
