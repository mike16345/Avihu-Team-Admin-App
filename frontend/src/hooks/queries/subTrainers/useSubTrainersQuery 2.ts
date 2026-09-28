import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { subTrainerKeys } from "./subTrainerKeys";
import { useUsersStore } from "@/store/userStore";

export const useSubTrainersQuery = (enabled = true) => {
  const { getAllSubTrainers } = useSubTrainersApi();
  const currentUserId = useUsersStore((state) => state.currentUser?._id);

  return useQuery({
    queryKey: subTrainerKeys.detail(currentUserId),
    queryFn: getAllSubTrainers,
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
    enabled,
  });
};
