import { useNavigate } from "react-router-dom";
import FoodCatalogPage from "../FoodCatalog/FoodCatalogPage";
import DietPlanTemplatesHeader from "../templates/dietTemplates/DietPlanTemplatesHeader";
import DietPlanV2AdminTabs from "../DietPlanV2/DietPlanV2AdminTabs";

const FoodCatalogPageWrapper = () => {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="flex flex-col gap-5 px-1 font-heebo">
      <DietPlanTemplatesHeader
        presetsOnly
        version={2}
        onVersionChange={(version) => {
          if (version === 1) navigate("/dietPlans?version=1");
        }}
      />
      <DietPlanV2AdminTabs active="catalog" />
      <FoodCatalogPage
        onAdd={() => navigate("/presets/admin/food-catalog/new")}
        onEdit={(catalogItemId) => navigate(`/presets/admin/food-catalog/${catalogItemId}/edit`)}
      />
    </div>
  );
};

export default FoodCatalogPageWrapper;
