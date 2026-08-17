import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFoodCatalogApi from "@/hooks/api/useFoodCatalogApi";
import type {
  FoodCatalogItemInput,
  FoodCatalogNutrition,
  FoodCatalogProduct,
} from "@/interfaces/IFoodCatalog";

interface FoodCatalogManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EditableServing = FoodCatalogItemInput["servings"][number] & { key: string };

interface FoodFormState {
  names: { he: string; en: string; original: string };
  brand: string;
  servings: EditableServing[];
}

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
  names: { he: "", en: "", original: "" },
  brand: "",
  servings: [emptyServing()],
});

const toForm = (product: FoodCatalogProduct): FoodFormState => ({
  names: {
    he: product.names.he ?? "",
    en: product.names.en ?? "",
    original: product.names.original ?? "",
  },
  brand: product.brand ?? "",
  servings: product.servings.map((serving) => ({
    ...serving,
    key: serving.id || crypto.randomUUID(),
    nutrition: { ...serving.nutrition },
  })),
});

const nutritionFields = [
  { key: "calories", label: "קלוריות" },
  { key: "protein", label: "חלבון" },
  { key: "carbohydrates", label: "פחמימות" },
  { key: "fat", label: "שומן" },
] as const;

const validate = (form: FoodFormState): string | null => {
  if (!form.names.he.trim() && !form.names.en.trim() && !form.names.original.trim()) {
    return "יש להזין לפחות שם אחד למזון";
  }
  if (!form.servings.length) return "יש להוסיף לפחות סוג מנה אחד";
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

const FoodCatalogManagerDialog = ({ open, onOpenChange }: FoodCatalogManagerDialogProps) => {
  const api = useFoodCatalogApi();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<FoodCatalogProduct | null>(null);
  const [form, setForm] = useState<FoodFormState>(emptyForm);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const productsQuery = useQuery({
    queryKey: ["admin-food-catalog", debouncedQuery],
    queryFn: ({ signal }) => api.search(debouncedQuery, signal),
    enabled: open,
    staleTime: 20_000,
  });

  const mutation = useMutation({
    mutationFn: (input: FoodCatalogItemInput) =>
      selected ? api.update(selected.id, input) : api.create(input),
    onSuccess: (product) => {
      toast.success(selected ? "המזון עודכן בהצלחה" : "המזון נוסף למאגר");
      setSelected(product);
      setForm(toForm(product));
      productsQuery.refetch();
    },
    onError: (error: Error) => toast.error(error.message || "לא ניתן היה לשמור את המזון"),
  });

  const resultDescription = useMemo(() => {
    if (productsQuery.isLoading) return "טוען את מאגר המזון…";
    if (!productsQuery.data?.length) return debouncedQuery ? "לא נמצאו תוצאות" : "המאגר עדיין ריק";
    return `${productsQuery.data.length} תוצאות`;
  }, [debouncedQuery, productsQuery.data, productsQuery.isLoading]);

  const startNew = () => {
    setSelected(null);
    setForm(emptyForm());
  };

  const chooseProduct = (product: FoodCatalogProduct) => {
    setSelected(product);
    setForm(toForm(product));
  };

  const updateServing = (index: number, patch: Partial<EditableServing>) => {
    setForm((current) => ({
      ...current,
      servings: current.servings.map((serving, servingIndex) =>
        servingIndex === index ? { ...serving, ...patch } : serving
      ),
    }));
  };

  const updateNutrition = (index: number, field: keyof FoodCatalogNutrition, rawValue: string) => {
    const value = rawValue === "" ? null : Number(rawValue);
    setForm((current) => ({
      ...current,
      servings: current.servings.map((serving, servingIndex) =>
        servingIndex === index
          ? { ...serving, nutrition: { ...serving.nutrition, [field]: value } }
          : serving
      ),
    }));
  };

  const save = () => {
    const error = validate(form);
    if (error) {
      toast.error(error);
      return;
    }
    const he = form.names.he.trim();
    const en = form.names.en.trim();
    const original = form.names.original.trim();
    const brand = form.brand.trim();
    mutation.mutate({
      names: {
        ...(he ? { he } : {}),
        ...(en ? { en } : {}),
        ...(original ? { original } : {}),
      },
      ...(brand ? { brand } : {}),
      servings: form.servings.map(({ id, description, quantity, unit, nutrition }) => ({
        id,
        description,
        quantity,
        unit,
        nutrition,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="flex h-[min(90vh,850px)] w-[min(96vw,1100px)] max-w-none flex-col gap-0 overflow-hidden border-0 p-0 font-heebo shadow-2xl"
      >
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-start dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-blue-600" /> מאגר המזון התזונתי
          </DialogTitle>
          <DialogDescription>
            הוסף מזון ידני או ערוך מזון שנסרק. לכל סוג מנה נשמרים הערכים המדויקים שלו.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 md:grid-cols-[310px_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-slate-100 bg-slate-50/70 p-4 md:border-b-0 md:border-l dark:border-slate-800 dark:bg-slate-950/30">
            <Button onClick={startNew} className="mb-3 gap-2">
              <Plus className="h-4 w-4" /> מזון חדש
            </Button>
            <div className="relative">
              <Search className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="חיפוש במאגר…"
                className="pe-9"
              />
            </div>
            <p className="px-1 py-2 text-xs text-slate-500">{resultDescription}</p>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {productsQuery.data?.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => chooseProduct(product)}
                  className={`w-full rounded-xl border p-3 text-start transition-colors ${
                    selected?.id === product.id
                      ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                      : "border-transparent bg-white hover:border-slate-200 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="block truncate text-sm font-semibold">
                    {product.displayName || "ללא שם"}
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {product.brand || `${product.servings.length} סוגי מנה`}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">{selected ? "עריכת מזון" : "מזון חדש"}</h3>
                {selected && (
                  <p className="text-xs text-slate-500">
                    {selected.provenance.provider === "open_food_facts"
                      ? "עריכה מקומית מעל נתוני Open Food Facts"
                      : "מזון שנוצר ידנית"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5">
                <Label>שם בעברית</Label>
                <Input
                  value={form.names.he}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      names: { ...current.names, he: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>שם באנגלית</Label>
                <Input
                  value={form.names.en}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      names: { ...current.names, en: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>שם מקור</Label>
                <Input
                  value={form.names.original}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      names: { ...current.names, original: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>מותג (אופציונלי)</Label>
                <Input
                  value={form.brand}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, brand: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold">סוגי מנה</h4>
                <p className="text-xs text-slate-500">
                  אפשר להוסיף כוס, כף, יחידה או כל תיאור אחר.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    servings: [...current.servings, emptyServing()],
                  }))
                }
              >
                <Plus className="h-4 w-4" /> הוסף סוג מנה
              </Button>
            </div>

            <div className="mt-3 space-y-4">
              {form.servings.map((serving, index) => (
                <section
                  key={serving.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold">מנה {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={form.servings.length === 1}
                      aria-label={`מחק מנה ${index + 1}`}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          servings: current.servings.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>תיאור</Label>
                      <Input
                        value={serving.description}
                        placeholder="לדוגמה: כף"
                        onChange={(event) =>
                          updateServing(index, { description: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>כמות</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="any"
                        value={serving.quantity}
                        onChange={(event) =>
                          updateServing(index, { quantity: Number(event.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>יחידה</Label>
                      <Input
                        value={serving.unit}
                        placeholder="גרם / כף / יחידה"
                        onChange={(event) => updateServing(index, { unit: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {nutritionFields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label>{field.label}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={serving.nutrition[field.key] ?? ""}
                          onChange={(event) =>
                            updateNutrition(index, field.key, event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>

        <DialogFooter className="flex-row justify-start gap-3 border-t border-slate-100 px-6 py-4 sm:justify-start sm:space-x-0 dark:border-slate-800">
          <Button onClick={save} disabled={mutation.isPending} className="min-w-28 gap-2">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            שמירה
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FoodCatalogManagerDialog;
