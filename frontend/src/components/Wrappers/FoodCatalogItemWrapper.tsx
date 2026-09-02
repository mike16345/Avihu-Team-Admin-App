import { useNavigate, useParams } from "react-router-dom";
import FoodCatalogItemPage from "../FoodCatalog/FoodCatalogItemPage";

const FoodCatalogItemPageWrapper = () => {
  const navigate = useNavigate();
  const { catalogItemId } = useParams<{
    catalogItemId?: string;
  }>();

  const handleBack = () => {
    navigate("/presets/admin/food-catalog");
  };

  const handleSaved = () => {
    navigate("/presets/admin/food-catalog");
  };

  return (
    <FoodCatalogItemPage catalogItemId={catalogItemId} onBack={handleBack} onSaved={handleSaved} />
  );
};

export default FoodCatalogItemPageWrapper;
