import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { useImageApi } from "./useImageApi";

const EXERCISE_PRESETS_ENDPOINT = "presets/exercises";

const useExercisePresetApi = () => {
  const { handleDeletePhoto, handleUploadImageToS3 } = useImageApi();

  const getExercisePresets = () =>
    fetchData<ApiResponse<IExercisePresetItem[]>>(EXERCISE_PRESETS_ENDPOINT);

  const getExerciseById = (id: string) =>
    fetchData<ApiResponse<IExercisePresetItem>>(EXERCISE_PRESETS_ENDPOINT + `/one`, { id });

  const getExerciseByMuscleGroup = (muscleGroup: string) =>
    fetchData<ApiResponse<IExercisePresetItem[]>>(EXERCISE_PRESETS_ENDPOINT + `/muscleGroup`, {
      muscleGroup,
    });

  const updateExercise = async (
    id: string,
    newExercise: IExercisePresetItem,
    imageToUpload?: string,
    imageToDelete?: string
  ) => {
    try {
      await handleDeletePhoto(`images/` + imageToDelete);

      if (imageToUpload && imageToUpload !== imageToDelete) {
        newExercise.imageUrl = await handleUploadImageToS3(newExercise.name, imageToUpload);
      }

      if (imageToDelete && !imageToUpload) {
        newExercise.imageUrl = "";
      }

      const res = await updateItem<IExercisePresetItem>(
        EXERCISE_PRESETS_ENDPOINT + `/one`,
        newExercise,
        null,
        {
          id,
        }
      );

      return res;
    } catch (error) {
      throw error;
    }
  };

  const addExercise = async (newExercise: IExercisePresetItem, image?: string) => {
    try {
      if (image) {
        newExercise.imageUrl = await handleUploadImageToS3(newExercise.name, image);
      }

      const res = await sendData<IExercisePresetItem>(EXERCISE_PRESETS_ENDPOINT, newExercise);

      return res;
    } catch (error) {
      throw error;
    }
  };

  const deleteExercise = (id: string) => deleteItem(EXERCISE_PRESETS_ENDPOINT + `/one`, { id });

  return {
    getExercisePresets,
    getExerciseById,
    updateExercise,
    addExercise,
    deleteExercise,
    getExerciseByMuscleGroup,
  };
};

export default useExercisePresetApi;
