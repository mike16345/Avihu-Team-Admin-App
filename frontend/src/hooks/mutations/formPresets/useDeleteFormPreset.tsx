import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";
import queryClient from "@/QueryClient/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useDeleteFormPreset = () => {
  const { deleteFormPreset } = useFormPresetApi();

  const onSuccess = () => {
    toast.success("שאלון נמחק בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.FORM_PRESETS] });
  };

  const onError = () => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
  };

  return useMutation({
    mutationFn: (id: string) => deleteFormPreset(id),
    onSuccess,
    onError,
  });
};

export default useDeleteFormPreset;
