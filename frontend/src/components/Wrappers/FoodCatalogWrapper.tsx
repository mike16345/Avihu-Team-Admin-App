import { useNavigate } from "react-router-dom";
import FoodCatalogPage from "../FoodCatalog/FoodCatalogPage";

const FoodCatalogPageWrapper = () => {
  const navigate = useNavigate();

  return (
    <FoodCatalogPage
      onAdd={() => navigate("/presets/admin/food-catalog/new")}
      onEdit={(catalogItemId) => navigate(`/presets/admin/food-catalog/${catalogItemId}/edit`)}
    />
  );
};

export default FoodCatalogPageWrapper;
