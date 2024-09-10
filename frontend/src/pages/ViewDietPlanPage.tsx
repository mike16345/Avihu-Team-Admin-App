import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { IDietPlan, IDietPlanPreset } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { Button } from "@/components/ui/button";
import { validateDietPlan } from "@/components/DietPlan/DietPlanSchema";

export const ViewDietPlanPage = () => {
  const { id } = useParams();
  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();
  const { getAllDietPlanPresets } = useDietPlanPresetApi();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);

  const [presetList, setPresetList] = useState<IDietPlanPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDietPlan = (dietPlan: IDietPlan) => setDietPlan(dietPlan);

  const handleSubmit = () => {
    if (!dietPlan) return;
    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    const { isValid, errors } = validateDietPlan(dietPlanToAdd);

    console.log("isvalid", isValid);
    if (!isValid) {
      toast.error(`יש בעיה בקלט.`);
      return;
    }
    if (isNewPlan) {
      createDietPlan(dietPlanToAdd);
    } else {
      editDietPlan(dietPlanToAdd);
    }
  };

  const createDietPlan = (dietPlan: IDietPlan) => {
    if (!dietPlan) return;

    addDietPlan(dietPlan)
      .then(() => {
        toast.success("תפריט נשמר בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: err.message });
        console.error("error", err);
      });
  };

  const editDietPlan = (dietPlan: IDietPlan) => {
    if (!dietPlan || !id) return;

    updateDietPlanByUserId(id, dietPlan)
      .then(() => {
        toast.success("תפריט עודכן בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: err.message });
      });
  };

  const handleSelect = (presetName: string) => {
    const selectedPreset = presetList?.find((preset) => preset.name === presetName);

    if (!selectedPreset) return;

    setDietPlan({
      ...selectedPreset,
      meals: selectedPreset.meals,
      totalCalories: selectedPreset.totalCalories,
    });
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    getAllDietPlanPresets()
      .then((res) => setPresetList(res))
      .catch((err) => setError(err));

    getDietPlanByUserId(id)
      .then((dietPlan) => {
        if (dietPlan) {
          setDietPlan(dietPlan);
          setIsNewPlan(false);
        } else {
          setDietPlan(defaultDietPlan);
          setIsNewPlan(true);
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      });
  }, []);

  if (isLoading || !dietPlan) return <Loader size="large" />;
  if (error) return <ErrorPage message={error} />;

  return (
    <div className=" flex flex-col gap-4 size-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      <Select onValueChange={(val) => handleSelect(val)}>
        <SelectTrigger dir="rtl" className="w-[350px] mr-1">
          <SelectValue placeholder="בחר תפריט" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {presetList?.map((preset) => (
            <SelectItem key={preset.name} value={preset.name}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DietPlanForm dietPlan={dietPlan} updateDietPlan={updateDietPlan} />
      {dietPlan.meals.length > 0 && (
        <div>
          <Button className="font-bold" variant="success" onClick={handleSubmit}>
            שמור תפריט
          </Button>
        </div>
      )}
    </div>
  );
};
