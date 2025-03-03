import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: Infinity },
  },
});

export default queryClient;
