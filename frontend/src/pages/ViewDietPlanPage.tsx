import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { IDietPlan, IDietPlanPreset } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { ERROR_MESSAGE_TITLE } from "@/enums/ErrorMessages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { useDietPlanPresetApi } from "@/hooks/useDietPlanPresetsApi";

export const ViewDietPlanPage = () => {
  const { id } = useParams();
  const { addDietPlan, updateDietPlanByUserId, getDietPlanByUserId } = useDietPlanApi();
  const { getAllDietPlanPresets } = useDietPlanPresetApi();

  const [isNewPlan, setIsNewPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState<IDietPlan | IDietPlanPreset>(defaultDietPlan);
  const [presetList, setPresetList] = useState<IDietPlanPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const createDietPlan = (dietPlan: IDietPlan) => {
    if (!dietPlan) return;

    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    addDietPlan(dietPlanToAdd)
      .then(() => {
        toast.success("תפריט נשמר בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGE_TITLE, { description: err.message });
        console.error("error", err);
      });
  };

  const editDietPlan = (dietPlan: IDietPlan) => {
    if (!dietPlan || !id) return;

    const dietPlanToAdd = {
      ...dietPlan,
      userId: id,
    };

    updateDietPlanByUserId(id, dietPlanToAdd)
      .then(() => {
        toast.success("תפריט עודכן בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGE_TITLE, { description: err.message });
      });
  };

  const handleSelect = (presetName: string) => {
    const selectedPreset = presetList?.find((preset) => preset.name === presetName);

    if (!selectedPreset) return;

    setDietPlan(selectedPreset);
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
        }, 1500);
      });
  }, []);

  if (isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error} />;

  return (
    <div className=" flex flex-col gap-4 w-4/5 h-full hide-scrollbar overflow-y-auto">
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
      <DietPlanForm
        existingDietPlan={dietPlan}
        handleSaveDietPlan={
          isNewPlan ? (dietPlan) => createDietPlan(dietPlan) : (dietPlan) => editDietPlan(dietPlan)
        }
      />
    </div>
  );
};
