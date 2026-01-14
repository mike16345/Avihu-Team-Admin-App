import { ONE_HOUR } from "@/constants/constants";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { FormResponse } from "@/interfaces/IFormResponse";
import { useQuery } from "@tanstack/react-query";

const useGetOneFormResponseQuery = (query: Partial<FormResponse>) => {
  const { getFormResponseByQuery } = useFormResponsesApi();

  const hasMonthlyFallback = query?.formType == "monthly";
  const stringifiedQuery = JSON.stringify(query);

  return useQuery({
    queryKey: [
      "formResponse",
      stringifiedQuery,
      hasMonthlyFallback ? "fallback:onboarding" : "fallback:none",
    ],
    queryFn: async () => {
      try {
        const result = await getFormResponseByQuery(query);

        return result;
      } catch (error: any) {
        console.log("Error", error.status);
        if (error?.status == 404 && hasMonthlyFallback) {
          console.log("Trying here");
          return await getFormResponseByQuery({
            ...query,
            formType: "onboarding",
          });
        }
      }
    },
    staleTime: ONE_HOUR,
    enabled: Boolean(query),
  });
};

export default useGetOneFormResponseQuery;
