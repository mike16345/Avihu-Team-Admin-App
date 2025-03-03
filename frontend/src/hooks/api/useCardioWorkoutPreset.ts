import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ICardioExerciseItem } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";

const useCardioWorkoutApi = () => {
  const CARDIO_WORKOUT_PRESETS_API = `/presets/cardioWorkout`;

  const getAllCardioWrkouts = () =>
    fetchData<ApiResponse<ICardioExerciseItem[]>>(CARDIO_WORKOUT_PRESETS_API);

  const getCardioWorkoutById = (id: string) =>
    fetchData<ApiResponse<ICardioExerciseItem>>(CARDIO_WORKOUT_PRESETS_API + `/one`, { id: id });

  const updateCardioWorkout = (id: string, newCardioWorkout: ICardioExerciseItem) =>
    updateItem(CARDIO_WORKOUT_PRESETS_API + `/one`, newCardioWorkout, null, { id });

  const addCardioWorkout = (newCardioWorkout: ICardioExerciseItem) =>
    sendData<ICardioExerciseItem>(CARDIO_WORKOUT_PRESETS_API, newCardioWorkout);

  const deleteCardioWorkout = (id: string) =>
    deleteItem(CARDIO_WORKOUT_PRESETS_API + `/one`, { id });

  return {
    getAllCardioWrkouts,
    getCardioWorkoutById,
    updateCardioWorkout,
    addCardioWorkout,
    deleteCardioWorkout,
  };
};

export default useCardioWorkoutApi;
