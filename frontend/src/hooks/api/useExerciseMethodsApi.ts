import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IExerciseMethod } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const useExerciseMethodApi = () => {
  const EXERCISE_METHODS_PRESETS_API = `presets/exerciseMethods`;

  const getAllExerciseMethods = () =>
    fetchData<ApiResponse<IExerciseMethod[]>>(EXERCISE_METHODS_PRESETS_API);

  const getExerciseMethodById = (id: string) =>
    fetchData<ApiResponse<IExerciseMethod>>(EXERCISE_METHODS_PRESETS_API + `/one`, { id: id });

  const updateExerciseMethod = (id: string, newExerciseMethod: IExerciseMethod) =>
    updateItem(EXERCISE_METHODS_PRESETS_API + `/one`, newExerciseMethod, null, { id });

  const addExerciseMethod = (newExerciseMethod: IExerciseMethod) =>
    sendData<IExerciseMethod>(EXERCISE_METHODS_PRESETS_API, newExerciseMethod);

  const addManyExerciseMethod = (newExerciseMethods: IExerciseMethod[]) =>
    sendData<IExerciseMethod[]>(EXERCISE_METHODS_PRESETS_API+`/many`, newExerciseMethods);

  const deleteExerciseMethod = (id: string) => deleteItem(EXERCISE_METHODS_PRESETS_API + `/one`, { id });

  return {
    getAllExerciseMethods,
    getExerciseMethodById,
    updateExerciseMethod,
    addExerciseMethod,
    deleteExerciseMethod,
    addManyExerciseMethod
  };
};

export default useExerciseMethodApi;
