import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TemplateTabs from "@/components/templates/TemplateTabs";
import DietPlanTemplatesHeader from "@/components/templates/dietTemplates/DietPlanTemplatesHeader";
import DietPlanV2TemplatesList from "@/components/DietPlanV2/DietPlanV2TemplatesList";
import { QueryKeys } from "@/enums/QueryKeys";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { ITabs } from "@/interfaces/interfaces";
import { useUsersStore } from "@/store/userStore";

/** Users on the "style 2" diet-plan preview. The templates page for
 *  these users has to hide the style-1 tab shelf entirely — v1's
 *  food-category tabs (protein / carbs / veggies / fats) and the
 *  legacy meal-preset cards are meaningless in the options-based
 *  model. When the per-trainer `dietPlanVersion` field lands on the
 *  Trainer entity, replace this hardcoded set with that flag. */
const STYLE_V2_USER_IDS = new Set<string>(["6774eb1c730c4c44354db2d0"]);

type DeleteMutation = ITabs["tabContent"][number]["deleteFunc"];
type DeleteMenuItem = ReturnType<typeof useMenuItemApi>["deleteMenuItem"];

const MENU_ITEM_QUERY_KEYS = {
  protein: "protein",
  carbs: "carbs",
  vegetables: "vegetables",
  fats: "fats",
} as const;

const invalidateMenuItemQueries = (queryClient: QueryClient, queryKey: string) => {
  queryClient.invalidateQueries({ queryKey: [queryKey] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.MENU_ITEMS] });
};

const createDeleteMenuItemOptions = (
  deleteMenuItem: DeleteMenuItem,
  queryClient: QueryClient,
  queryKey: string
) => ({
  mutationFn: deleteMenuItem,
  onSuccess: () => {
    invalidateMenuItemQueries(queryClient, queryKey);
    toast.success("פריט נמחק בהצלחה!");
  },
  onError: () => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
  },
});

const getDietPlanTabs = (deleteMutations: {
  deleteDietPlan: DeleteMutation;
  deleteProteins: DeleteMutation;
  deleteCarbs: DeleteMutation;
  deleteVegetables: DeleteMutation;
  deleteFats: DeleteMutation;
}): ITabs => ({
  tabHeaders: [
    {
      name: "תפריטים",
      value: "dietPlanPresets",
      queryKey: QueryKeys.DIET_PLAN_PRESETS,
    },
    {
      name: "חלבונים",
      value: "proteinItems",
      queryKey: MENU_ITEM_QUERY_KEYS.protein,
    },
    {
      name: "פחמימות",
      value: "carbItems",
      queryKey: MENU_ITEM_QUERY_KEYS.carbs,
    },
    {
      name: "ירקות",
      value: "vegetableItems",
      queryKey: MENU_ITEM_QUERY_KEYS.vegetables,
    },
    {
      name: "שומנים",
      value: "fatsItems",
      queryKey: MENU_ITEM_QUERY_KEYS.fats,
    },
  ],
  tabContent: [
    {
      value: "dietPlanPresets",
      btnPrompt: "הוסף תפריט",
      sheetForm: "dietPlans",
      deleteFunc: deleteMutations.deleteDietPlan,
    },
    {
      value: "proteinItems",
      btnPrompt: "הוסף חלבון",
      sheetForm: "protein",
      deleteFunc: deleteMutations.deleteProteins,
    },
    {
      value: "carbItems",
      btnPrompt: "הוסף פחמימה",
      sheetForm: "carbs",
      deleteFunc: deleteMutations.deleteCarbs,
    },
    {
      value: "vegetableItems",
      btnPrompt: "הוסף ירקות",
      sheetForm: "vegetables",
      deleteFunc: deleteMutations.deleteVegetables,
    },
    {
      value: "fatsItems",
      btnPrompt: "הוסף שומנים",
      sheetForm: "fats",
      deleteFunc: deleteMutations.deleteFats,
    },
  ],
});

const DietPlanTemplatePage = () => {
  const currentUserId = useUsersStore((state) => state.currentUser?._id);
  const isStyleV2 = !!currentUserId && STYLE_V2_USER_IDS.has(currentUserId);
  const { deleteMenuItem } = useMenuItemApi();
  const { deleteDietPlanPreset } = useDietPlanPresetApi();
  const queryClient = useQueryClient();

  const deleteDietPlan = useMutation({
    mutationFn: deleteDietPlanPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS] });
      toast.success("תפריט נמחק בהצלחה!");
    },
    onError: () => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
    },
  });
  const deleteCarbs = useMutation(
    createDeleteMenuItemOptions(deleteMenuItem, queryClient, MENU_ITEM_QUERY_KEYS.carbs)
  );
  const deleteFats = useMutation(
    createDeleteMenuItemOptions(deleteMenuItem, queryClient, MENU_ITEM_QUERY_KEYS.fats)
  );
  const deleteVegetables = useMutation(
    createDeleteMenuItemOptions(deleteMenuItem, queryClient, MENU_ITEM_QUERY_KEYS.vegetables)
  );
  const deleteProteins = useMutation(
    createDeleteMenuItemOptions(deleteMenuItem, queryClient, MENU_ITEM_QUERY_KEYS.protein)
  );

  const tabs = getDietPlanTabs({
    deleteDietPlan,
    deleteProteins,
    deleteCarbs,
    deleteVegetables,
    deleteFats,
  });

  return (
    <div
      data-testid="diet-plan-templates-page"
      dir="rtl"
      className="flex flex-col gap-5 px-1 font-heebo"
    >
      <DietPlanTemplatesHeader />
      {isStyleV2 ? <DietPlanV2TemplatesList /> : <TemplateTabs tabs={tabs} />}
    </div>
  );
};

export default DietPlanTemplatePage;
