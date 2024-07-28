import { fetchData } from "@/API/api";
import { IRecordedSet } from "@/interfaces/IWorkout";

const RECORDED_SETS_ENDPOINT = "recordedSets/";

export const useRecordedSetsApi = () => {
  const getRecordedSetsByUserId = (userID: string) =>
    fetchData<IRecordedSet[]>(`${RECORDED_SETS_ENDPOINT}user/${userID}`);

  const getRecordedSets = (id: string) => fetchData<IRecordedSet>(RECORDED_SETS_ENDPOINT + id);

  const getUserRecordedExerciseNamesByMuscleGroup = (userId: string, muscleGroup: string) => {
    return fetchData<string[]>(
      RECORDED_SETS_ENDPOINT + userId + "/" + muscleGroup + "/exerciseNames"
    );
  };

  const getUserRecordedSetsByMuscleGroup = (userId: string, muscleGroup: string) => {
    return fetchData<IRecordedSet[]>(RECORDED_SETS_ENDPOINT + userId + "/" + muscleGroup);
  };

  return {
    getRecordedSets,
    getRecordedSetsByUserId,
    getUserRecordedSetsByMuscleGroup,
    getUserRecordedExerciseNamesByMuscleGroup,
  };
};
