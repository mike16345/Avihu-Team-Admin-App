import { IDietPlan } from "@/interfaces/IDietPlan";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import DietPlanForm from "@/components/DietPlan/DietPlanForm";
import { useDietPlanPresetApi } from "@/hooks/useDietPlanPresetsApi";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeIdsAndVersions } from "@/utils/dietPlanUtils";
import { ERROR_MESSAGE_TITLE } from "@/enums/ErrorMessages";

export const ViewDietPlanPresetPage = () => {
  const { id } = useParams();

  const { getDietPlanPreset, updateDietPlanPreset, addDietPlanPreset } = useDietPlanPresetApi();

  const [isNewPlan, setIsNewPlan] = useState(false);

  const [dietPlan, setDietPlan] = useState<IDietPlan>();

  const [presetName, setPresetName] = useState<string>();

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string>();

  const createDietPlanPreset = (dietPlan: IDietPlan) => {
    if (!dietPlan || !presetName) return;

    const dietPlanToAdd = {
      ...dietPlan,
      name: presetName,
    };

    addDietPlanPreset(dietPlanToAdd)
      .then(() => {
        toast.success("תפריט נשמר בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGE_TITLE, { description: err.response.data.message });
        console.error("error", err);
      });
  };

  const editDietPlanPreset = (dietPlan: IDietPlan) => {
    if (!dietPlan || !id || !presetName) return;

    const dietPlanToAdd = removeIdsAndVersions({
      ...dietPlan,
      name: presetName,
    });

    updateDietPlanPreset(id, dietPlanToAdd)
      .then(() => {
        toast.success("תפריט עודכן בהצלחה!");
      })
      .catch((err) => {
        toast.error(ERROR_MESSAGE_TITLE, { description: err.response.data.message });
        console.error("error", err);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    if (id) {
      getDietPlanPreset(id)
        .then((dietPlan) => {
          setDietPlan(dietPlan);
          setPresetName(dietPlan.name);
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
      }, 1500);
    }
  }, []);

  if (isLoading) return <Loader size="large" />;
  if (error) return <ErrorPage message={error} />;

  return (
    <div className=" flex flex-col gap-4 w-4/5 h-full hide-scrollbar overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-4">עריכת תפריט תזונה</h1>
      <Label className="mr-1 font-bold">שם</Label>
      <Input
        placeholder="שם לתפריט..."
        className="w-[400px] mr-1"
        onChange={(e) => setPresetName(e.target.value)}
        value={presetName}
      />
      <DietPlanForm
        existingDietPlan={dietPlan}
        handleSaveDietPlan={
          isNewPlan
            ? (dietPlanPreset) => createDietPlanPreset(dietPlanPreset)
            : (dietPlanPreset) => editDietPlanPreset(dietPlanPreset)
        }
      />
    </div>
  );
};
