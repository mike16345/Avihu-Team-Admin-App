import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ILessonGroup } from "@/interfaces/IBlog";
import { ApiResponse } from "@/types/types";

const LESSON_GROUP_API_ENDPOINT = "lessonGroups";

const useLessonGroupsApi = () => {
  const createLessonGroup = async (group: ILessonGroup) => {
    return await sendData<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT, group);
  };

  const updateLessonGroup = async (id: string, group: ILessonGroup) => {
    return await updateItem<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT + "/one", {
      id,
      group,
    });
  };

  const getLessonGroups = async () => {
    return await fetchData<ApiResponse<ILessonGroup[]>>(LESSON_GROUP_API_ENDPOINT);
  };

  const getLessonGroupById = async (id: string) => {
    return await fetchData<ApiResponse<ILessonGroup[]>>(LESSON_GROUP_API_ENDPOINT + "/one", { id });
  };

  const deleteLessonGroup = async (id: string) => {
    return await deleteItem<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT, { id });
  };

  return {
    createLessonGroup,
    updateLessonGroup,
    deleteLessonGroup,
    getLessonGroupById,
    getLessonGroups,
  };
};

export default useLessonGroupsApi;
