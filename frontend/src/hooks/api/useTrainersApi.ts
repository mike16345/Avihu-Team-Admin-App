import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import type {
  CreateTrainerBody,
  PaginatedResponse,
  PaginatedTrainerRow,
  Trainer,
  TrainerDeleteResponse,
  TrainerGetOneDTO,
  TrainerGetOneResponse,
  TrainerId,
  TrainerPaginatedParams,
  TrainerPaginatedResponse,
  TrainerResponse,
  TrainersResponse,
  UpdateTrainerBody,
} from "@/interfaces/trainers";

const TRAINERS_ENDPOINT = "trainers";

const serializeParam = (value?: string | Record<string, unknown>) => {
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : JSON.stringify(value);
};

export const useTrainersApi = () => {
  const getAllTrainers = async (): Promise<Trainer[]> => {
    const response = await fetchData<TrainersResponse>(TRAINERS_ENDPOINT);
    return response.data;
  };

  const getPaginatedTrainers = async (
    params: TrainerPaginatedParams = {}
  ): Promise<PaginatedResponse<PaginatedTrainerRow>> => {
    const response = await fetchData<TrainerPaginatedResponse>(`${TRAINERS_ENDPOINT}/paginated`, {
      page: params.page,
      limit: params.limit,
      query: serializeParam(params.query),
      sort: serializeParam(params.sort),
    });

    return response.data;
  };

  const getTrainer = async (id: TrainerId): Promise<TrainerGetOneDTO> => {
    const response = await fetchData<TrainerGetOneResponse>(`${TRAINERS_ENDPOINT}/one`, { id });

    return response.data;
  };

  const createTrainer = async (body: CreateTrainerBody): Promise<Trainer> => {
    const response = await sendData<TrainerResponse>(TRAINERS_ENDPOINT, body);
    return response.data;
  };

  const updateTrainer = async (id: TrainerId, body: UpdateTrainerBody): Promise<Trainer> => {
    const response = await updateItem<TrainerResponse>(
      `${TRAINERS_ENDPOINT}/one`,
      body,
      undefined,
      {
        id,
      }
    );

    return response.data;
  };

  const deleteTrainer = async (id: TrainerId): Promise<Trainer | null> => {
    const response = await deleteItem<TrainerDeleteResponse>(`${TRAINERS_ENDPOINT}/one`, { id });
    return response.data;
  };

  return {
    createTrainer,
    deleteTrainer,
    getAllTrainers,
    getPaginatedTrainers,
    getTrainer,
    updateTrainer,
  };
};
