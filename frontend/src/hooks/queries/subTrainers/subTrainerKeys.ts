import { SubTrainerPaginatedParams } from "@/interfaces/trainers";

const serializeParam = (value?: string | Record<string, unknown>) => {
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : JSON.stringify(value);
};

export const subTrainerKeys = {
  all: ["subTrainers"] as const,
  list: () => [...subTrainerKeys.all, "list"] as const,
  paginated: (params: SubTrainerPaginatedParams = {}) =>
    [
      ...subTrainerKeys.all,
      "paginated",
      {
        page: params.page,
        limit: params.limit,
        query: serializeParam(params.query),
        sort: serializeParam(params.sort),
      },
    ] as const,
  detail: (id?: string) => [...subTrainerKeys.all, "detail", id] as const,
};
