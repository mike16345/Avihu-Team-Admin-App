import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useAddFormPreset = () => {
  const { addFormPreset } = useFormPresetApi();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    toast.success(`שאלון נשמר בהצלחה!`);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.FORM_PRESETS] });
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.data.message });
  };

  return useMutation({
    mutationFn: addFormPreset,
    onSuccess,
    onError,
  });
};

export default useAddFormPreset;
