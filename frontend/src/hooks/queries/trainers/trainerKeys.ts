import { TrainerPaginatedParams } from "@/interfaces/trainers";

const serializeParam = (value?: string | Record<string, unknown>) => {
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : JSON.stringify(value);
};

export const trainerKeys = {
  all: ["trainers"] as const,
  list: () => [...trainerKeys.all, "list"] as const,
  paginated: (params: TrainerPaginatedParams = {}) =>
    [
      ...trainerKeys.all,
      "paginated",
      {
        page: params.page,
        limit: params.limit,
        query: serializeParam(params.query),
        sort: serializeParam(params.sort),
      },
    ] as const,
  detail: (id?: string) => [...trainerKeys.all, "detail", id] as const,
};
