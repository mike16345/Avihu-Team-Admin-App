import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { ONE_HOUR } from "@/constants/constants";
import { createRetryFunction } from "@/lib/utils";
import { IRecordedSet } from "@/interfaces/IWorkout";

const useUserRecordedSets = (userId?: string) => {
  const { getRecordedSetsByUserId } = useRecordedSetsApi();

  const handleGetRecordedSets = async () => {
    try {
      const data = await getRecordedSetsByUserId(userId!);

      return data;
    } catch (error) {
      console.error("Error fetching recorded sets:", error);
      throw error;
    }
  };

  return useQuery({
    queryFn: handleGetRecordedSets,
    queryKey: [`${QueryKeys.RECORDED_WORKOUTS}${userId}`],
    staleTime: ONE_HOUR * 2,
    retry: createRetryFunction(404),
    enabled: !!userId,
  });
};

export default useUserRecordedSets;
