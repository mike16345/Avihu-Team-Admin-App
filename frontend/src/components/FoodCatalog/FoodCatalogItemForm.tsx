import { useEffect, useState } from "react";
import { Beef, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  FoodCatalogItemInput,
  FoodCatalogNutrition,
  FoodCatalogProduct,
} from "@/interfaces/IFoodCatalog";

type EditableServing = FoodCatalogItemInput["servings"][number] & {
  key: string;
};

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

  /*
   * Important for edit routes:
   * the component may render once before the query finishes,
   * so update the form when the loaded product changes.
   */
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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">פרטי המזון</h2>

          <p className="mt-1 text-sm text-slate-500">
            הזן את השמות והמותג של המזון. מספיק למלא שם אחד.
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="food-name-he">שם בעברית</Label>

            <Input
              id="food-name-he"
              value={form.names.he}
              placeholder="לדוגמה: חמאת בוטנים"
              className="h-11"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,

                  names: {
                    ...current.names,

                    he: event.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="food-name-en">שם באנגלית</Label>

            <Input
              id="food-name-en"
              value={form.names.en}
              placeholder="Peanut Butter"
              className="h-11"
              dir="ltr"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,

                  names: {
                    ...current.names,

                    en: event.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="food-original-name">שם מקור</Label>

            <Input
              id="food-original-name"
              value={form.names.original}
              placeholder="שם כפי שמופיע במקור"
              className="h-11"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,

                  names: {
                    ...current.names,

                    original: event.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="food-brand">
              מותג
              <span className="me-1 font-normal text-slate-400">אופציונלי</span>
            </Label>

            <Input
              id="food-brand"
              value={form.brand}
              placeholder="לדוגמה: Skippy"
              className="h-11"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,

                  brand: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* Servings */}
      {/* ========================================= */}

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
            <div
              key={serving.key}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Serving header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Beef className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      מנה {index + 1}
                    </h3>

                    {serving.description && (
                      <p className="mt-0.5 text-xs text-slate-400">{serving.description}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={form.servings.length === 1}
                  onClick={() => removeServing(index)}
                  aria-label={`מחק מנה ${index + 1}`}
                  className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5 sm:p-7">
                {/* Serving definition */}
                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>תיאור המנה</Label>

                    <Input
                      value={serving.description}
                      placeholder="לדוגמה: כף"
                      className="h-11"
                      onChange={(event) =>
                        updateServing(index, {
                          description: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>כמות</Label>

                    <Input
                      type="number"
                      min="0.01"
                      step="any"
                      value={serving.quantity}
                      className="h-11"
                      onChange={(event) =>
                        updateServing(index, {
                          quantity: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>יחידה</Label>

                    <Input
                      value={serving.unit}
                      placeholder="גרם / מ״ל / יחידה"
                      className="h-11"
                      onChange={(event) =>
                        updateServing(index, {
                          unit: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Nutrition separator */}
                <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

                {/* Nutrition */}
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      ערכים תזונתיים
                    </h4>

                    <p className="mt-1 text-xs text-slate-400">
                      הערכים מתייחסים למנה שהוגדרה למעלה.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {nutritionFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label>{field.label}</Label>

                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={serving.nutrition[field.key] ?? ""}
                            className="h-11 ps-14"
                            onChange={(event) =>
                              updateNutrition(index, field.key, event.target.value)
                            }
                          />

                          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            {field.suffix}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================= */}
      {/* Bottom actions */}
      {/* ========================================= */}

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
