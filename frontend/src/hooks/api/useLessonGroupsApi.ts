import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ILessonGroup } from "@/interfaces/IBlog";
import { ApiResponse } from "@/types/types";

const LESSON_GROUP_API_ENDPOINT = "lessonGroups";

const useLessonGroupsApi = () => {
  const createLessonGroup = (group: ILessonGroup) => {
    return sendData<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT, group);
  };

  const updateLessonGroup = (id: string, group: ILessonGroup) => {
    return updateItem<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT + "/one", {
      id,
      group,
    });
  };

  const getLessonGroups = () => {
    return fetchData<ApiResponse<ILessonGroup[]>>(LESSON_GROUP_API_ENDPOINT);
  };

  const getLessonGroupById = (id: string) => {
    return fetchData<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT + "/one", { id });
  };

  const deleteLessonGroup = (id: string) => {
    return deleteItem<ApiResponse<ILessonGroup>>(LESSON_GROUP_API_ENDPOINT + "/one", { id });
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
