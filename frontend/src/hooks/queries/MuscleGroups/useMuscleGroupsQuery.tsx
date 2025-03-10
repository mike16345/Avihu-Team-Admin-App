import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { useQuery } from "@tanstack/react-query";

const useMuscleGroupsQuery = () => {
  const { getAllMuscleGroups } = useMuscleGroupsApi();

  return useQuery({
    queryKey: [QueryKeys.MUSCLE_GROUP],
    queryFn: getAllMuscleGroups,
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useMuscleGroupsQuery;
