/**
 * ExtraItems — side sheet for adding free-text "extra" items to a
 * macro section in a trainee's diet plan.
 *
 * Two big UX upgrades on this pass:
 *   1. **History** — every item the trainer has ever added (across
 *      trainees) is remembered locally and surfaced as click-to-add
 *      suggestions. Saves retyping common items like "סלמון" or
 *      "פסטה מלאה" every time. Backed by useExtraItemsHistory.
 *   2. **Brand-blue palette** — was emerald; now uses the same
 *      brand-blue accents as the rest of the redesign so the sheet
 *      reads as part of the same product surface.
 *
 * Section context (e.g. "protein") drives both the suggestions list
 * (per-section history) and the contextual sheet title.
 */
import { FC, useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  FaCheck,
  FaPlus,
  FaXmark,
  FaPenToSquare,
  FaClockRotateLeft,
  FaTrash,
} from "react-icons/fa6";
import { useExtraItemsHistory } from "@/hooks/useExtraItemsHistory";

const nameSchema = z.object({
  name: z.string().min(1, "יש להכניס שם פריט").max(50, "השם ארוך מדי"),
});

type NameFormData = z.infer<typeof nameSchema>;

interface ExtraItemsProps {
  trigger: React.ReactNode;
  existingItems?: string[];
  /** Macro section key — drives the per-section suggestions store. */
  section?: string;
  onAddItem: (items: string[]) => void;
}

const ExtraItems: FC<ExtraItemsProps> = ({
  trigger,
  existingItems = [],
  section = "general",
  onAddItem,
}) => {
  const [extraItems, setExtraItems] = useState<string[]>(existingItems);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<string | null>(null);
  const history = useExtraItemsHistory(section);

  useEffect(() => {
    setExtraItems(existingItems);
    // Backfill history from the trainee's already-saved items —
    // they were typed in earlier sessions (possibly pre-history)
    // and should still surface as suggestions for the next trainee.
    existingItems.forEach((it) => history.remember(it));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingItems]);

  const formControl = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  const currentInput = formControl.watch("name") || "";

  // Suggestions = history items that aren't already in the current
  // trainee's list. We also drop the item currently being edited so
  // we don't suggest something that's literally in the input box.
  const suggestions = useMemo(() => {
    const matches = history.filter(currentInput);
    return matches.filter((h) => !extraItems.includes(h) && h !== editItem);
  }, [history, currentInput, extraItems, editItem]);

  const commitItem = (raw: string) => {
    const newItem = raw.trim();
    if (!newItem) return;
    if (extraItems.includes(newItem) && newItem !== editItem) {
      formControl.setError("name", { message: "פריט זה כבר קיים ברשימה" });
      return;
    }
    if (editItem) {
      const updated = extraItems.map((item) => (item === editItem ? newItem : item));
      setExtraItems(updated);
      onAddItem(updated);
      setEditItem(null);
    } else {
      const updated = [...extraItems, newItem];
      setExtraItems(updated);
      onAddItem(updated);
    }
    history.remember(newItem);
    formControl.reset();
  };

  const onSubmit = (data: NameFormData) => commitItem(data.name);

  const addFromSuggestion = (name: string) => {
    // One-click add — no need to type.
    commitItem(name);
  };

  const removeExtraItem = (item: string) => {
    const updated = extraItems.filter((i) => i !== item);
    setExtraItems(updated);
    setEditItem(null);
    onAddItem(updated);
    formControl.reset();
  };

  const startEditItem = (item: string) => {
    setEditItem(item);
    formControl.setValue("name", item);
  };

  const onCloseSheet = () => {
    setIsSheetOpen(false);
    formControl.reset();
    setEditItem(null);
  };

  return (
    <>
      <div className="w-fit" onClick={() => setIsSheetOpen(true)}>
        {trigger}
      </div>
      <Sheet open={isSheetOpen} onOpenChange={onCloseSheet}>
        <SheetContent
          dir="rtl"
          className="border-blue-100/60 dark:border-blue-900/40 bg-white dark:bg-slate-900 sm:max-w-md flex flex-col"
          style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
        >
          {/* Header */}
          <SheetHeader className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-right">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
                <FaPlus size={13} />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editItem ? "עריכת פריט" : "הוספת פריט"}
                </SheetTitle>
                <SheetDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                  {editItem
                    ? "ערוך את שם הפריט הקיים או מחק אותו מהרשימה"
                    : "הוסף פריט חופשי, או לחץ על אחד מהפריטים האחרונים שלך"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Form {...formControl}>
            <form
              onSubmit={formControl.handleSubmit(onSubmit)}
              className="space-y-3 text-right pt-4"
            >
              <FormField
                control={formControl.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      שם פריט
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="לדוגמה: סלמון, פסטה מלאה…"
                        className="h-11 text-sm rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2 pt-1">
                {editItem && (
                  <>
                    <button
                      type="button"
                      onClick={() => removeExtraItem(editItem)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <FaTrash size={10} />
                      מחק
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditItem(null);
                        formControl.reset();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      בטל
                    </button>
                  </>
                )}
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  {editItem ? <FaPenToSquare size={11} /> : <FaCheck size={11} />}
                  {editItem ? "עדכן" : "שמור פריט"}
                </button>
              </div>
            </form>
          </Form>

          {/* Suggestions from history — one-click to add. The
              section is per-macro so suggestions stay relevant. */}
          {suggestions.length > 0 && (
            <div className="mt-5 text-right space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <FaClockRotateLeft size={9} />
                  פריטים שהשתמשת בהם בעבר
                </h3>
                <span className="text-[10px] text-slate-400">לחץ להוספה מהירה</span>
              </div>
              <div className="max-h-44 overflow-y-auto rounded-xl border border-blue-100/60 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/20 p-2">
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 24).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addFromSuggestion(s)}
                      className="group inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white dark:border-blue-900/40 dark:bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    >
                      <FaPlus size={8} />
                      {s}
                    </button>
                  ))}
                </div>
                {suggestions.length > 24 && (
                  <p className="mt-1.5 text-[10px] text-slate-400 text-center">
                    + עוד {suggestions.length - 24} פריטים — חפש בשורת החיפוש למעלה
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Current trainee's added items */}
          <div className="mt-5 text-right space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                בתפריט הזה ({extraItems.length})
              </h3>
              {extraItems.length > 0 && (
                <span className="text-[10px] text-slate-400">לחץ פריט לעריכה</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {extraItems.length === 0 ? (
                <div className="w-full rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  אין פריטים נוספים עדיין
                </div>
              ) : (
                extraItems.map((item) => {
                  const isEditing = editItem === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => startEditItem(item)}
                      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                        isEditing
                          ? "border-blue-400 bg-blue-100 text-blue-800 shadow-sm dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      }`}
                    >
                      <span>{item}</span>
                      {isEditing ? (
                        <FaXmark size={9} />
                      ) : (
                        <FaPenToSquare size={9} className="opacity-50 group-hover:opacity-100" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ExtraItems;
