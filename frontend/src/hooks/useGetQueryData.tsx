import { useQueryClient } from "@tanstack/react-query";

export const useGetQueryData = <T,>(key: string[]): T | undefined => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData<T>(key);
};
