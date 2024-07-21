import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IWorkoutItem } from "@/interfaces/IWorkoutPlan";

const EXERCISE_PRESETS_ENDPOINT = "/presets/exercises/";


const useExercisePresetApi = () => {
    const getExercisePresets = () => fetchData<IWorkoutItem[]>(EXERCISE_PRESETS_ENDPOINT)

    const getExerciseById = (id: string) => fetchData<IWorkoutItem>(EXERCISE_PRESETS_ENDPOINT + id)

    const updateExercise = (id: string, newExercise: IWorkoutItem) => updateItem(EXERCISE_PRESETS_ENDPOINT + id, newExercise)

    const addExercise = (newExercise: IWorkoutItem) => sendData<IWorkoutItem>(EXERCISE_PRESETS_ENDPOINT, newExercise)
    const deleteExercise = (id: string) => deleteItem(EXERCISE_PRESETS_ENDPOINT, id)

    return {
        getExercisePresets,
        getExerciseById,
        updateExercise,
        addExercise,
        deleteExercise
    }
}

export default useExercisePresetApi
