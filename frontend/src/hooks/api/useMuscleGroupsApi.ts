import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IMuscleGroupItem } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const useMuscleGroupsApi = () => {
  const MUSCLEGROUP_PRESETS_API = `muscleGroups`;

  const getAllMuscleGroups = () =>
    fetchData<ApiResponse<IMuscleGroupItem[]>>(MUSCLEGROUP_PRESETS_API);

  const getMuscleGroupById = (id: string) =>
    fetchData<ApiResponse<IMuscleGroupItem>>(MUSCLEGROUP_PRESETS_API + `/one`, { id: id });

  const updateMuscleGroup = (id: string, newExercise: IMuscleGroupItem) =>
    updateItem(MUSCLEGROUP_PRESETS_API + `/one`, newExercise, null, { id });

  const addMuscleGroup = (newExercise: IMuscleGroupItem) =>
    sendData<IMuscleGroupItem>(MUSCLEGROUP_PRESETS_API, newExercise);

  const deleteMuscleGroup = (id: string) => deleteItem(MUSCLEGROUP_PRESETS_API + `/one`, { id });

  return {
    getAllMuscleGroups,
    getMuscleGroupById,
    updateMuscleGroup,
    addMuscleGroup,
    deleteMuscleGroup,
  };
};

export default useMuscleGroupsApi;
