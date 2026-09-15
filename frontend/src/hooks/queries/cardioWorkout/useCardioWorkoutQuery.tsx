import { useQuery } from "@tanstack/react-query";
import { ICardioWorkout } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useUsersStore } from "@/store/userStore";

const useCardioWorkoutQuery = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";
  const { getAllCardioWrkouts } = useCardioWorkoutApi();

  return useQuery<any, any, ApiResponse<ICardioWorkout[]>, any>({
    queryFn: () => getAllCardioWrkouts(),
    queryKey: [QueryKeys.CARDIO_WORKOUT_PRESET, trainerId],
    staleTime: FULL_DAY_STALE_TIME / 2,
  });
};

export default useCardioWorkoutQuery;
