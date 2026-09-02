import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";
import { useUsersStore } from "@/store/userStore";

const useFormPresetsQuery = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";

  const { getAllFormPresets } = useFormPresetApi();

  return useQuery({
    queryKey: [QueryKeys.FORM_PRESETS, trainerId],
    queryFn: getAllFormPresets,
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useFormPresetsQuery;
