import { fetchData } from "@/API/api";
import { IUserMuscleMeasurements } from "@/interfaces/measurements";
import { ApiResponse } from "@/types/types";

const MEASUREMENT_ENDPOINT = "measurements";

export const useMeasurementApi = () => {
  const getMeasurements = (userId: string) =>
    fetchData<ApiResponse<IUserMuscleMeasurements>>(MEASUREMENT_ENDPOINT + "/one", { userId }).then(
      (res) => res.data
    );

  return { getMeasurements };
};
