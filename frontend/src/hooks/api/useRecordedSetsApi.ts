import { fetchData, sendData, updateItem } from "@/API/api";
import { IMuscleGroupRecordedSets, IRecordedSet } from "@/interfaces/IWorkout";
import { ApiResponse } from "@/types/types";

const RECORDED_SETS_ENDPOINT = "recordedSets";

export const useRecordedSetsApi = () => {
  const addRecordedSet = (recordedSet: IRecordedSet) => {
    return sendData<IRecordedSet>(RECORDED_SETS_ENDPOINT, recordedSet);
  };

  const updateRecordedSet = (id: string, recordedSet: IRecordedSet) => {
    const endpoint = `${RECORDED_SETS_ENDPOINT}/id?=${id}`;

    return updateItem(endpoint, recordedSet);
  };

  const getRecordedSetsByUserId = (id: string) => {
    const endpoint = `${RECORDED_SETS_ENDPOINT}/user?userId=${id}`;

    return fetchData<ApiResponse<IMuscleGroupRecordedSets[]>>(endpoint).then((res) => res.data);
  };

  const getUserRecordedMuscleGroupNames = (id: string) => {
    const endpoint = `${RECORDED_SETS_ENDPOINT} + /user/names/muscleGroups?userId=${id}`;

    return fetchData<string[]>(endpoint);
  };

  const getUserRecordedExerciseNamesByMuscleGroup = (id: string, group: string) => {
    const endpoint = `${RECORDED_SETS_ENDPOINT} + /user/names?userId=${id}&muscleGroup=${group}`;

    return fetchData<string[]>(endpoint, { muscleGroup: group });
  };

  return {
    addRecordedSet,
    updateRecordedSet,
    getRecordedSetsByUserId,
    getUserRecordedMuscleGroupNames,
    getUserRecordedExerciseNamesByMuscleGroup,
  };
};
