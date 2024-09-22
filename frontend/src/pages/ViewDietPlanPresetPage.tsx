import { IDietPlan, IDietPlanPreset } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { Input } from "@/components/ui/input";
import { removeIdsAndVersions } from "@/utils/dietPlanUtils";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/ui/CustomButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useNavigate } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";

const presetNameShcema = z.object({
  name: z.string().min(1, { message: `בחר שם לתפריט` }).max(25),
});

export const ViewDietPlanPresetPage = () => {
  const navigation = useNavigate();
  const { id } = useParams();
  const { getDietPlanPreset, updateDietPlanPreset, addDietPlanPreset } = useDietPlanPresetApi();
  const queryClient = useQueryClient();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState<IDietPlan>(defaultDietPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetNameForm = useForm<z.infer<typeof presetNameShcema>>({
    resolver: zodResolver(presetNameShcema),
    defaultValues: {
      name: "",
    },
  });

  const { reset } = presetNameForm;

  const onSuccess = () => {
    navigation(MainRoutes.DIET_PLANS);
    toast.success("תפריט נשמר בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS] });
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e?.data?.message || "",
    });
  };

  const createPreset = useMutation({
    mutationFn: addDietPlanPreset,
    onSuccess: onSuccess,
    onError: onError,
  });

  const updatePreset = useMutation({
    mutationFn: ({ id, cleanedDietPlan }: { id: string; cleanedDietPlan: IDietPlanPreset }) =>
      updateDietPlanPreset(id, cleanedDietPlan),
    onSuccess: onSuccess,
    onError: onError,
  });

  const handleSubmit = (values: z.infer<typeof presetNameShcema>) => {
    const dietPlanToAdd = {
      ...dietPlan,
      name: values.name,
    };

    if (isNewPlan) {
      createPreset.mutate(dietPlanToAdd);
    } else {
      if (!id) return;

      const cleanedDietPlan = removeIdsAndVersions(dietPlanToAdd);

      updatePreset.mutate({ id, cleanedDietPlan });
    }
  };

  const updateDietPlan = (dietPlan: IDietPlan) => setDietPlan(dietPlan);

  useEffect(() => {
    setIsLoading(true);
    if (id) {
      getDietPlanPreset(id)
        .then((dietPlan) => {
          setDietPlan(dietPlan.data);
          reset(dietPlan.data);
          setIsNewPlan(false);
        })
        .catch((err: Error) => {
          setError(err.message);
        })
        .finally(() => {
          setTimeout(() => {
            setIsLoading(false);
          }, 1500);
        });
    } else {
      setDietPlan(defaultDietPlan);
      setIsNewPlan(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, []);

  if (isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error} />;

  return (
    <div className=" flex flex-col gap-4 size-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      <div className="w-1/3 mr-1">
        <Form {...presetNameForm}>
          <form>
            <FormField
              control={presetNameForm.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="font-bold underline pb-3">שם התפריט:</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="שם לתפריט..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </form>
        </Form>
      </div>
      <DietPlanForm dietPlan={dietPlan} updateDietPlan={updateDietPlan} />
      {dietPlan.meals.length > 0 && (
        <div>
          <CustomButton
            className="font-bold"
            variant="success"
            title="שמור תפריט"
            isLoading={createPreset.isPending || updatePreset.isPending}
            onClick={presetNameForm.handleSubmit(handleSubmit)}
          />
        </div>
      )}
    </div>
  );
};
