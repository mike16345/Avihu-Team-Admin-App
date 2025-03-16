import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: Infinity },
  },
});

export const invalidateQueryKeys = (keys: string[]) => {
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

export default queryClient;
