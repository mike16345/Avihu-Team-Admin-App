import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ISession, IUser } from "@/interfaces/IUser";
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

  const updateUserField = <K extends keyof IUser>(
    userId: string,
    fieldName: K,
    value: IUser[K]
  ) => {
    return updateItem<ApiResponse<IUser>>(USERS_ENDPOINT + `/one/field?userId=${userId}`, {
      fieldName,
      value,
    });
  };

  const loginUser = (email: string, password: string) =>
    sendData<ApiResponse<ISession>>(USERS_ENDPOINT + `/user/login`, {
      email,
      password,
      isAdminApp: true,
    });

  const checkUserSessionToken = (token: ISession) => {
    return sendData<ApiResponse<{ isValid: boolean }>>(USERS_ENDPOINT + `/user/session`, {
      token,
    }).then((res) => res.data);
  };

  const getAllUsers = () => fetchData<ApiResponse<IUser[]>>(USERS_ENDPOINT).then((res) => res.data);

  return {
    addUser,
    checkUserSessionToken,
    updateUserField,
    updateUser,
    deleteManyUsers,
    deleteUser,
    getUser,
    getAllUsers,
    loginUser,
  };
};
