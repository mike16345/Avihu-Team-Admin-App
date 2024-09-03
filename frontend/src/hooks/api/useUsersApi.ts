import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IUser } from "@/interfaces/IUser";
import { ApiResponse } from "@/types/types";

const USERS_ENDPOINT = "users";

export const useUsersApi = () => {
  const addUser = (user: IUser) => sendData<IUser>(USERS_ENDPOINT, user);

  const updateUser = (userID: string, user: IUser) =>
    updateItem(`${USERS_ENDPOINT}${userID}`, user, null, { id: userID });

  const deleteUser = (userID: string) => deleteItem(`${USERS_ENDPOINT}`, userID);

  const getUser = (id: string) =>
    fetchData<ApiResponse<IUser>>(USERS_ENDPOINT, { userId: id }).then((res) => res.data);

  const getAllUsers = () => fetchData<ApiResponse<IUser[]>>(USERS_ENDPOINT).then((res) => res.data);

  return {
    addUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers,
  };
};
