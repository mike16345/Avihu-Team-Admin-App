import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";
import { createRetryFunction } from "@/lib/utils";

const useFormPresetQuery = (formId?: string) => {
  const { getFormPresetById } = useFormPresetApi();

  return useQuery({
    queryKey: [QueryKeys.FORM_PRESET, formId],
    enabled: !!formId,
    queryFn: () => getFormPresetById(formId!),
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
  });
};

export default useFormPresetQuery;
