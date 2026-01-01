import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useFormPresetApi from "@/hooks/api/useFormPresetApi";
import { IForm } from "@/interfaces/IForm";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateFormPreset = (id?: string) => {
  const { updateFormPreset } = useFormPresetApi();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    toast.success(`שאלון נשמר בהצלחה!`);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.FORM_PRESET, id] });
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.data.message });
  };

  return useMutation({
    mutationFn: ({ id, formPreset }: { id: string; formPreset: IForm }) =>
      updateFormPreset(id, formPreset),
    onSuccess,
    onError,
  });
};

export default useUpdateFormPreset;
