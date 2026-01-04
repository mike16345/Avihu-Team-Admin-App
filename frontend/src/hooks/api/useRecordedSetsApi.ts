import { fetchData } from "@/API/api";
import { IMuscleGroupRecordedSets } from "@/interfaces/IWorkout";
import { ApiResponse } from "@/types/types";

const RECORDED_SETS_ENDPOINT = "recordedSets";

export const useRecordedSetsApi = () => {
  const getRecordedSetsByUserId = (id: string) => {
    const endpoint = `${RECORDED_SETS_ENDPOINT}/user?userId=${id}`;

    return fetchData<ApiResponse<IMuscleGroupRecordedSets[]>>(endpoint).then((res) => res.data);
  };

  return {
    getRecordedSetsByUserId,
  };
};
