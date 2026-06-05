/**
 * ExtraItems — side sheet for adding free-text "extra" items to a macro
 * section (e.g. custom protein sources the trainer types in).
 *
 * Visual refresh: clean white sheet, Heebo font, RTL, emerald save button,
 * outlined chips that look like the rest of the diet-plan editor.
 */
import { FC, useEffect, useState } from "react";
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
import { FaCheck, FaPlus, FaXmark, FaPenToSquare } from "react-icons/fa6";

const nameSchema = z.object({
  name: z.string().min(1, "יש להכניס שם פריט").max(50, "השם ארוך מדי"),
});

type NameFormData = z.infer<typeof nameSchema>;

interface ExtraItemsProps {
  trigger: React.ReactNode;
  existingItems?: string[];
  onAddItem: (items: string[]) => void;
}

const ExtraItems: FC<ExtraItemsProps> = ({ trigger, existingItems = [], onAddItem }) => {
  const [extraItems, setExtraItems] = useState<string[]>(existingItems);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<string | null>(null);

  useEffect(() => {
    setExtraItems(existingItems);
  }, [existingItems]);

  const formControl = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: NameFormData) => {
    const newItem = data.name.trim();
    if (extraItems.includes(newItem)) {
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
    formControl.reset();
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
          className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        >
          <SheetHeader className="space-y-1 pb-4">
            <SheetTitle className="text-right text-xl font-bold text-slate-900 dark:text-slate-100">
              {editItem ? "עריכת פריט" : "הוספת פריט"}
            </SheetTitle>
            <SheetDescription className="text-right text-xs text-slate-500 dark:text-slate-400">
              {editItem
                ? "ערוך את שם הפריט הקיים או מחק אותו מהרשימה"
                : "הוסף פריט חופשי שלא קיים ברשימה הקבועה"}
            </SheetDescription>
          </SheetHeader>

          <Form {...formControl}>
            <form onSubmit={formControl.handleSubmit(onSubmit)} className="space-y-4 text-right">
              <FormField
                control={formControl.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      שם פריט
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="הכנס פריט כאן…" className="h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                {editItem && (
                  <>
                    <button
                      type="button"
                      onClick={() => removeExtraItem(editItem)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      מחק
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditItem(null);
                        formControl.reset();
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      בטל
                    </button>
                  </>
                )}
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
                >
                  {editItem ? <FaPenToSquare size={11} /> : <FaCheck size={11} />}
                  {editItem ? "עדכן" : "שמור"}
                </button>
              </div>
            </form>
          </Form>

          <div className="mt-6 space-y-2 text-right">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              פריטים נוספים
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {extraItems.length === 0 ? (
                <div className="text-xs text-slate-400 dark:text-slate-500">
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
                      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                        isEditing
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300"
                      }`}
                    >
                      <span>{item}</span>
                      {isEditing ? <FaXmark size={9} /> : <FaPlus size={9} />}
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
