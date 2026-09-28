import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import type {
  CreateSubTrainerBody,
  PaginatedResponse,
  PaginatedSubTrainerRow,
  SubTrainer,
  SubTrainerDeleteResponse,
  SubTrainerGetOneDTO,
  SubTrainerGetOneResponse,
  SubTrainerId,
  SubTrainerPaginatedParams,
  SubTrainerPaginatedResponse,
  SubTrainerResponse,
  SubTrainersResponse,
  UpdateSubTrainerBody,
} from "@/interfaces/trainers";

const SUB_TRAINERS_ENDPOINT = "subTrainers";

const serializeParam = (value?: string | Record<string, unknown>) => {
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : JSON.stringify(value);
};

export const useSubTrainersApi = () => {
  const getAllSubTrainers = async (): Promise<SubTrainer[]> => {
    const response = await fetchData<SubTrainersResponse>(SUB_TRAINERS_ENDPOINT);
    return response.data;
  };

  const getPaginatedSubTrainers = async (
    params: SubTrainerPaginatedParams = {}
  ): Promise<PaginatedResponse<PaginatedSubTrainerRow>> => {
    const response = await fetchData<SubTrainerPaginatedResponse>(
      `${SUB_TRAINERS_ENDPOINT}/paginated`,
      {
        page: params.page,
        limit: params.limit,
        query: serializeParam(params.query),
        sort: serializeParam(params.sort),
      }
    );

    return response.data;
  };

  const getSubTrainer = async (id: SubTrainerId): Promise<SubTrainerGetOneDTO> => {
    const response = await fetchData<SubTrainerGetOneResponse>(`${SUB_TRAINERS_ENDPOINT}/one`, {
      id,
    });

    return response.data;
  };

  const createSubTrainer = async (body: CreateSubTrainerBody): Promise<SubTrainer> => {
    const response = await sendData<SubTrainerResponse>(SUB_TRAINERS_ENDPOINT, body);
    return response.data;
  };

  const updateSubTrainer = async (
    id: SubTrainerId,
    body: UpdateSubTrainerBody
  ): Promise<SubTrainer> => {
    const response = await updateItem<SubTrainerResponse>(
      `${SUB_TRAINERS_ENDPOINT}/one`,
      body,
      undefined,
      { id }
    );

    return response.data;
  };

  const deleteSubTrainer = async (id: SubTrainerId): Promise<SubTrainer | null> => {
    const response = await deleteItem<SubTrainerDeleteResponse>(`${SUB_TRAINERS_ENDPOINT}/one`, {
      id,
    });

    return response.data;
  };

  return {
    createSubTrainer,
    deleteSubTrainer,
    getAllSubTrainers,
    getPaginatedSubTrainers,
    getSubTrainer,
    updateSubTrainer,
  };
};
