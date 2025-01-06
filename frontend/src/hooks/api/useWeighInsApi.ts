import { deleteItem, fetchData } from "@/API/api";
import { IWeighIn, IWeighIns } from "@/interfaces/IWeighIns";
import { ApiResponse } from "@/types/types";

const WEIGH_INS_ENDPOINT = "weighIns/weights";

export const useWeighInsApi = () => {
  const deleteWeighIns = (userID: string) => deleteItem(WEIGH_INS_ENDPOINT, { id: userID });

  const deleteWeighInsByUserId = (userID: string) =>
    deleteItem(WEIGH_INS_ENDPOINT + "/user", { id: userID });

  const getWeighInsByUserId = (userID: string) =>
    fetchData<ApiResponse<IWeighIn[]>>(`${WEIGH_INS_ENDPOINT}/user`, { id: userID }).then(
      (res) => res.data
    );

  const getWeighInsById = (id: string) =>
    fetchData<ApiResponse<IWeighIns>>(WEIGH_INS_ENDPOINT, { id }).then((res) => res.data);

  return {
    getWeighInsByUserId,
    deleteWeighIns,
    deleteWeighInsByUserId,
    getWeighInsById,
  };
};
