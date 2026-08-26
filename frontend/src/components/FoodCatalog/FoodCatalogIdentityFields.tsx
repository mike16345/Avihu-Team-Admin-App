import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FoodCatalogIdentityFieldsProps {
  names: { he: string; en: string; original: string };
  brand: string;
  onNameChange: (field: "he" | "en" | "original", value: string) => void;
  onBrandChange: (value: string) => void;
}

const FoodCatalogIdentityFields = ({
  names,
  brand,
  onNameChange,
  onBrandChange,
}: FoodCatalogIdentityFieldsProps) => (
  <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <header className="border-b border-slate-100 bg-gradient-to-l from-blue-50/70 to-white px-5 py-5 sm:px-7 dark:border-slate-800 dark:from-blue-950/20 dark:to-slate-900">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">פרטי המזון</h2>
      <p className="mt-1 text-sm text-slate-500">מלאו לפחות שם אחד. מותג הוא אופציונלי.</p>
    </header>
    <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="food-name-he">שם בעברית</Label>
        <Input
          id="food-name-he"
          value={names.he}
          placeholder="לדוגמה: חמאת בוטנים"
          className="h-11"
          onChange={(event) => onNameChange("he", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="food-name-en">שם באנגלית</Label>
        <Input
          id="food-name-en"
          value={names.en}
          placeholder="Peanut Butter"
          className="h-11"
          dir="ltr"
          onChange={(event) => onNameChange("en", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="food-original-name">שם מקור</Label>
        <Input
          id="food-original-name"
          value={names.original}
          placeholder="שם כפי שמופיע במקור"
          className="h-11"
          onChange={(event) => onNameChange("original", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="food-brand">
          מותג <span className="me-1 font-normal text-slate-400">אופציונלי</span>
        </Label>
        <Input
          id="food-brand"
          value={brand}
          placeholder="לדוגמה: Skippy"
          className="h-11"
          onChange={(event) => onBrandChange(event.target.value)}
        />
      </div>
    </div>
  </section>
);

export default FoodCatalogIdentityFields;
