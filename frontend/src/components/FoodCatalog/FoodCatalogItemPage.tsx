import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Pencil, Plus, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import useFoodCatalogApi from "@/hooks/api/useFoodCatalogApi";
import type { FoodCatalogItemInput, FoodCatalogProduct } from "@/interfaces/IFoodCatalog";

import FoodCatalogItemForm from "./FoodCatalogItemForm";

interface FoodCatalogItemPageProps {
  catalogItemId?: string;

  onBack?: () => void;

  onSaved?: (product: FoodCatalogProduct) => void;
}

const FoodCatalogItemPage = ({ catalogItemId, onBack, onSaved }: FoodCatalogItemPageProps) => {
  const api = useFoodCatalogApi();

  const isEdit = Boolean(catalogItemId);

  const productQuery = useQuery({
    queryKey: ["admin-food-catalog-item", catalogItemId],

    queryFn: ({ signal }) => api.getFoodCatalogItemById(catalogItemId!, signal),

    enabled: isEdit,
    staleTime: 20_000,
  });

  const mutation = useMutation({
    mutationFn: (input: FoodCatalogItemInput) => {
      if (catalogItemId) {
        return api.update(catalogItemId, input);
      }

      return api.create(input);
    },

    onSuccess: (product) => {
      toast.success(isEdit ? "המזון עודכן בהצלחה" : "המזון נוסף למאגר");

      onSaved?.(product);
    },

    onError: (error: Error) => {
      toast.error(
        error.message || (isEdit ? "לא ניתן היה לעדכן את המזון" : "לא ניתן היה להוסיף את המזון")
      );
    },
  });

  if (isEdit && productQuery.isLoading) {
    return (
      <div dir="rtl" className="flex min-h-[450px] items-center justify-center font-heebo">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm">טוען את פרטי המזון...</span>
        </div>
      </div>
    );
  }

  if (isEdit && productQuery.isError) {
    return (
      <div dir="rtl" className="mx-auto max-w-xl px-6 py-20 text-center font-heebo">
        <h2 className="text-lg font-bold">לא ניתן לטעון את המזון</h2>

        <p className="mt-2 text-sm text-slate-500">
          {productQuery.error instanceof Error
            ? productQuery.error.message
            : "אירעה שגיאה בעת טעינת הפריט."}
        </p>

        {onBack && (
          <Button variant="outline" className="mt-6" onClick={onBack}>
            חזרה למאגר
          </Button>
        )}
      </div>
    );
  }

  const product = productQuery.data;
  console.log("product", product);

  return (
    <div dir="rtl" className="min-h-full bg-slate-50/40 font-heebo dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb-ish back */}
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-me-2 mb-5 gap-2 text-slate-500"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה למאגר
          </Button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isEdit
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              }`}
            >
              {isEdit ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {isEdit ? "עריכת מזון" : "הוספת מזון חדש"}
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {isEdit
                  ? "עדכן את פרטי המזון, סוגי המנות והערכים התזונתיים."
                  : "הוסף מזון חדש למאגר והגדר את סוגי המנות והערכים התזונתיים שלו."}
              </p>

              {isEdit && product?.provenance?.provider === "open_food_facts" && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  מבוסס על Open Food Facts
                </div>
              )}
            </div>
          </div>
        </div>

        <FoodCatalogItemForm
          initialProduct={product}
          isSubmitting={mutation.isPending}
          submitLabel={isEdit ? "שמור שינויים" : "הוסף למאגר"}
          onSubmit={(input) => mutation.mutate(input)}
          onCancel={onBack}
        />
      </div>
    </div>
  );
};

export default FoodCatalogItemPage;
