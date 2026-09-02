import { useEffect, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import FoodCatalogIdentityFields from "./FoodCatalogIdentityFields";
import FoodCatalogServingCard, { type EditableServing } from "./FoodCatalogServingCard";

import type {
  FoodCatalogItemInput,
  FoodCatalogNutrition,
  FoodCatalogProduct,
} from "@/interfaces/IFoodCatalog";

interface FoodFormState {
  names: {
    he: string;
    en: string;
    original: string;
  };

  brand: string;

  servings: EditableServing[];
}

interface FoodCatalogItemFormProps {
  initialProduct?: FoodCatalogProduct;

  isSubmitting?: boolean;

  submitLabel?: string;

  onSubmit: (input: FoodCatalogItemInput) => void;

  onCancel?: () => void;
}

const nutritionFields = [
  {
    key: "calories",
    label: "קלוריות",
    suffix: "קק״ל",
  },
  {
    key: "protein",
    label: "חלבון",
    suffix: "גרם",
  },
  {
    key: "carbohydrates",
    label: "פחמימות",
    suffix: "גרם",
  },
  {
    key: "fat",
    label: "שומן",
    suffix: "גרם",
  },
] as const;

const emptyNutrition = (): FoodCatalogNutrition => ({
  calories: null,
  protein: null,
  carbohydrates: null,
  fat: null,
  saturatedFat: null,
  sugars: null,
  fiber: null,
  sodium: null,
  salt: null,
});

const emptyServing = (): EditableServing => ({
  key: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unit: "יחידה",
  nutrition: emptyNutrition(),
});

const emptyForm = (): FoodFormState => ({
  names: {
    he: "",
    en: "",
    original: "",
  },

  brand: "",

  servings: [emptyServing()],
});

const productToForm = (product: FoodCatalogProduct): FoodFormState => ({
  names: {
    he: product.names.he ?? "",
    en: product.names.en ?? "",
    original: product.names.original ?? "",
  },

  brand: product.brand ?? "",

  servings: product.servings.map((serving) => ({
    ...serving,

    key: serving.id || crypto.randomUUID(),

    nutrition: {
      ...serving.nutrition,
    },
  })),
});

const validateForm = (form: FoodFormState): string | null => {
  const hasName = form.names.he.trim() || form.names.en.trim() || form.names.original.trim();

  if (!hasName) {
    return "יש להזין לפחות שם אחד למזון";
  }

  if (!form.servings.length) {
    return "יש להוסיף לפחות סוג מנה אחד";
  }

  for (let index = 0; index < form.servings.length; index += 1) {
    const serving = form.servings[index];

    if (!serving.description.trim() || !serving.unit.trim() || serving.quantity <= 0) {
      return `יש להשלים את פרטי מנה ${index + 1}`;
    }

    for (const field of nutritionFields) {
      const value = serving.nutrition[field.key];

      if (value === null || !Number.isFinite(value) || value < 0) {
        return `יש להשלים ${field.label} במנה ${index + 1}`;
      }
    }
  }

  return null;
};

const FoodCatalogItemForm = ({
  initialProduct,
  isSubmitting = false,
  submitLabel = "שמירה",
  onSubmit,
  onCancel,
}: FoodCatalogItemFormProps) => {
  const [form, setForm] = useState<FoodFormState>(() =>
    initialProduct ? productToForm(initialProduct) : emptyForm()
  );

  useEffect(() => {
    if (initialProduct) {
      setForm(productToForm(initialProduct));
    }
  }, [initialProduct]);

  const updateServing = (index: number, patch: Partial<EditableServing>) => {
    setForm((current) => ({
      ...current,

      servings: current.servings.map((serving, servingIndex) =>
        servingIndex === index
          ? {
              ...serving,
              ...patch,
            }
          : serving
      ),
    }));
  };

  const updateNutrition = (index: number, field: keyof FoodCatalogNutrition, rawValue: string) => {
    const value = rawValue === "" ? null : Number(rawValue);

    setForm((current) => ({
      ...current,

      servings: current.servings.map((serving, servingIndex) =>
        servingIndex === index
          ? {
              ...serving,

              nutrition: {
                ...serving.nutrition,

                [field]: value,
              },
            }
          : serving
      ),
    }));
  };

  const addServing = () => {
    setForm((current) => ({
      ...current,

      servings: [...current.servings, emptyServing()],
    }));
  };

  const removeServing = (index: number) => {
    if (form.servings.length === 1) {
      return;
    }

    setForm((current) => ({
      ...current,

      servings: current.servings.filter((_, servingIndex) => servingIndex !== index),
    }));
  };

  const handleSubmit = () => {
    const validationError = validateForm(form);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const he = form.names.he.trim();
    const en = form.names.en.trim();
    const original = form.names.original.trim();
    const brand = form.brand.trim();

    const input: FoodCatalogItemInput = {
      names: {
        ...(he ? { he } : {}),
        ...(en ? { en } : {}),
        ...(original ? { original } : {}),
      },

      ...(brand ? { brand } : {}),

      servings: form.servings.map(({ id, description, quantity, unit, nutrition }) => ({
        id,

        description: description.trim(),

        quantity,

        unit: unit.trim(),

        nutrition,
      })),
    };

    onSubmit(input);
  };

  return (
    <div className="space-y-8">
      <FoodCatalogIdentityFields
        names={form.names}
        brand={form.brand}
        onNameChange={(field, value) =>
          setForm((current) => ({
            ...current,
            names: { ...current.names, [field]: value },
          }))
        }
        onBrandChange={(brand) => setForm((current) => ({ ...current, brand }))}
      />

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">סוגי מנה</h2>

            <p className="mt-1 text-sm text-slate-500">
              הגדר מנה אחת או יותר עם הערכים התזונתיים המדויקים שלה.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addServing}
            className="gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            הוסף סוג מנה
          </Button>
        </div>

        <div className="space-y-5">
          {form.servings.map((serving, index) => (
            <FoodCatalogServingCard
              key={serving.key}
              serving={serving}
              index={index}
              canRemove={form.servings.length > 1}
              onChange={(patch) => updateServing(index, patch)}
              onNutritionChange={(field, value) => updateNutrition(index, field, value)}
              onRemove={() => removeServing(index)}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sm:min-w-28"
          >
            ביטול
          </Button>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 sm:min-w-36"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default FoodCatalogItemForm;
