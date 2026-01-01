import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";

const useFormPresetQuery = (formId?: string) => {
  const { getFormPresetById } = useFormPresetApi();

  return useQuery({
    queryKey: [QueryKeys.FORM_PRESET, formId],
    enabled: !!formId,
    queryFn: () => getFormPresetById(formId!),
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useFormPresetQuery;
