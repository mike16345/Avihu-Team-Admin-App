import { useQuery } from "@tanstack/react-query";
import { IUserMuscleMeasurements } from "@/interfaces/measurements";
import { useMeasurementApi } from "@/hooks/api/useMeasurementsApi";
import { HALF_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { createRetryFunction } from "@/lib/utils";

const useMeasurementQuery = (userId?: string) => {
  const { getMeasurements } = useMeasurementApi();

  return useQuery<any, any, IUserMuscleMeasurements, any>({
    queryFn: () => getMeasurements(userId!),
    queryKey: [QueryKeys.USER_MEASUREMENTS + userId],
    enabled: !!userId,
    retry: createRetryFunction(404, 2),
    staleTime: HALF_DAY_STALE_TIME,
  });
};

export default useMeasurementQuery;
