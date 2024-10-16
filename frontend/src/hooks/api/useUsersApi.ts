import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IUser } from "@/interfaces/IUser";
import { ApiResponse } from "@/types/types";

const USERS_ENDPOINT = "users";

export const useUsersApi = () => {
  const addUser = (user: IUser) => sendData<IUser>(USERS_ENDPOINT, user);

  const updateUser = (userID: string, user: IUser) =>
    updateItem(`${USERS_ENDPOINT}/one`, user, null, { id: userID });

  const deleteUser = (userID: string) =>
    deleteItem<ApiResponse<any>>(`${USERS_ENDPOINT}/one?id=${userID}`);

  const deleteManyUsers = (userIds: string[]) => {
    return deleteItem(`${USERS_ENDPOINT}/many`, undefined, undefined, { userIds });
  };

  const getUser = (id: string) => {
    return fetchData<ApiResponse<IUser>>(USERS_ENDPOINT + "/one", { userId: id }).then(
      (res) => res.data
    );
  };

  const getAllUsers = () => fetchData<ApiResponse<IUser[]>>(USERS_ENDPOINT).then((res) => res.data);

  return {
    addUser,
    updateUser,
    deleteManyUsers,
    deleteUser,
    getUser,
    getAllUsers,
  };
};
