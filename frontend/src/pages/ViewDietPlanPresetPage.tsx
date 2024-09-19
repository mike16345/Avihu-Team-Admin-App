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

const presetNameShcema = z.object({
  name: z.string().min(1, { message: `בחר שם לתפריט` }).max(25),
});

export const ViewDietPlanPresetPage = () => {
  const { id } = useParams();
  const { getDietPlanPreset, updateDietPlanPreset, addDietPlanPreset } = useDietPlanPresetApi();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState<IDietPlan>(defaultDietPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetNameForm = useForm<z.infer<typeof presetNameShcema>>({
    resolver: zodResolver(presetNameShcema),
    defaultValues: {
      name: "",
    },
  });

  const { reset } = presetNameForm;

  const handleSubmit = (values: z.infer<typeof presetNameShcema>) => {
    const dietPlanToAdd = {
      ...dietPlan,
      name: values.name,
    };

    if (isNewPlan) {
      createDietPlanPreset(dietPlanToAdd);
    } else {
      editDietPlanPreset(dietPlanToAdd);
    }
  };

  const updateDietPlan = (dietPlan: IDietPlan) => setDietPlan(dietPlan);

  const createDietPlanPreset = (dietPlan: IDietPlanPreset) => {
    if (!dietPlan) return;

    setButtonLoading(true);
    addDietPlanPreset(dietPlan)
      .then(() => {
        toast.success("תפריט נשמר בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: err?.data?.message || "",
        });
      })
      .finally(() => setButtonLoading(false));
  };

  const editDietPlanPreset = (dietPlan: IDietPlanPreset) => {
    if (!dietPlan || !id) return;

    const cleanedDietPlan = removeIdsAndVersions(dietPlan);

    updateDietPlanPreset(id, cleanedDietPlan)
      .then(() => {
        toast.success("תפריט עודכן בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: err?.data?.message || "",
        });
        console.error("error", err);
      });
  };

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
            isLoading={buttonLoading}
            onClick={presetNameForm.handleSubmit(handleSubmit)}
          />
        </div>
      )}
    </div>
  );
};
