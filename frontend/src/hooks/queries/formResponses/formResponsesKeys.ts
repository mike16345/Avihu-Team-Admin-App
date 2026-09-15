export type FormResponsesQueryParams = {
  userId?: string;
};

export const formResponsesKeys = {
  all: (trainerId: string) => ["formResponses", trainerId] as const,
  list: (trainerId: string, params?: FormResponsesQueryParams) =>
    [...formResponsesKeys.all(trainerId), "list", params ?? {}] as const,
  one: (responseId?: string, trainerId?: string) =>
    [...formResponsesKeys.all(trainerId || ""), "one", responseId] as const,
};
