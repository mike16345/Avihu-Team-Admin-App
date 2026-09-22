import { Beef, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FoodCatalogItemInput, FoodCatalogNutrition } from "@/interfaces/IFoodCatalog";

export type EditableServing = FoodCatalogItemInput["servings"][number] & { key: string };

interface FoodCatalogServingCardProps {
  serving: EditableServing;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<EditableServing>) => void;
  onNutritionChange: (field: keyof FoodCatalogNutrition, value: string) => void;
  onRemove: () => void;
}

const nutritionFields = [
  { key: "calories", label: "קלוריות", suffix: "קק״ל" },
  { key: "protein", label: "חלבון", suffix: "גרם" },
  { key: "carbohydrates", label: "פחמימות", suffix: "גרם" },
  { key: "fat", label: "שומן", suffix: "גרם" },
] as const;

const FoodCatalogServingCard = ({
  serving,
  index,
  canRemove,
  onChange,
  onNutritionChange,
  onRemove,
}: FoodCatalogServingCardProps) => (
  <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-l from-blue-50/70 to-white px-5 py-4 sm:px-6 dark:border-slate-800 dark:from-blue-950/20 dark:to-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <Beef className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">מנה {index + 1}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {serving.description || "הגדירו כמות, יחידה וערכים תזונתיים"}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label={`מחק מנה ${index + 1}`}
        className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </header>

    <div className="space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`serving-description-${serving.key}`}>שם המנה</Label>
          <Input
            id={`serving-description-${serving.key}`}
            value={serving.description}
            placeholder="לדוגמה: כף או 100 גרם"
            className="h-11"
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`serving-quantity-${serving.key}`}>כמות בסיס</Label>
          <Input
            id={`serving-quantity-${serving.key}`}
            type="number"
            min="0.01"
            step="any"
            value={serving.quantity}
            className="h-11"
            onChange={(event) => onChange({ quantity: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`serving-unit-${serving.key}`}>יחידה</Label>
          <Input
            id={`serving-unit-${serving.key}`}
            value={serving.unit}
            placeholder="גרם / מ״ל / כוס"
            className="h-11"
            onChange={(event) => onChange({ unit: event.target.value })}
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">ערכים תזונתיים</h4>
          <p className="mt-1 text-xs text-slate-500">עבור כמות הבסיס שהוגדרה למעלה.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {nutritionFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`${field.key}-${serving.key}`}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={`${field.key}-${serving.key}`}
                  type="number"
                  min="0"
                  step="any"
                  value={serving.nutrition[field.key] ?? ""}
                  className="h-11 ps-14"
                  onChange={(event) => onNutritionChange(field.key, event.target.value)}
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
  </article>
);

export default FoodCatalogServingCard;
