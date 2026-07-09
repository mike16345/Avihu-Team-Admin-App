import { fetchData } from "@/API/api";
import type { IStepsProgress } from "@/interfaces/IStepsProgress";
import type { ApiResponse } from "@/types/types";

const STEPS_PROGRESS_ENDPOINT = "steps";

export const useStepsProgressApi = () => {
  const getStepsProgressByUserId = (userId: string, from?: string, to?: string) =>
    fetchData<ApiResponse<IStepsProgress[]>>(`${STEPS_PROGRESS_ENDPOINT}/user`, {
      userId,
      from,
      to,
    });

  return {
    getStepsProgressByUserId,
  };
};
