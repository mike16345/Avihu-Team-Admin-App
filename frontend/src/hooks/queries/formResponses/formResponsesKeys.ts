export type FormResponsesQueryParams = {
  userId?: string;
};

export const formResponsesKeys = {
  all: ["formResponses"] as const,
  list: (params?: FormResponsesQueryParams) =>
    [...formResponsesKeys.all, "list", params ?? {}] as const,
  one: (responseId?: string) => [...formResponsesKeys.all, "one", responseId] as const,
};
