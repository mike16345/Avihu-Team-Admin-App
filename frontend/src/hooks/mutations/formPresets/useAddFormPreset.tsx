import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const useAddFormPreset = () => {
  const { addFormPreset } = useFormPresetApi();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const onSuccess = () => {
    toast.success(`שאלון נשמר בהצלחה!`);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.FORM_PRESETS] });
    navigate("/form-builder");
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e?.data?.message });
  };

  return useMutation({
    mutationFn: addFormPreset,
    onSuccess,
    onError,
  });
};

export default useAddFormPreset;
