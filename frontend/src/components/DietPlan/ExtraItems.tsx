import { FC, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
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
import CustomButton from "@/components/ui/CustomButton";
import { Button } from "../ui/button";
import DeleteButton from "../ui/buttons/DeleteButton";
import { cn } from "@/lib/utils";

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
      const updatedItems = extraItems.map((item) => (item === editItem ? newItem : item));
      setExtraItems(updatedItems);
      onAddItem(updatedItems);
      setEditItem(null);
    } else {
      const updatedItems = [...extraItems, newItem];
      setExtraItems(updatedItems);
      onAddItem(updatedItems);
    }

    formControl.reset();
  };

  const removeExtraItem = (item: string) => {
    const updatedItems = extraItems.filter((i) => i !== item);
    setExtraItems(updatedItems);
    setEditItem(null);
    onAddItem(updatedItems);
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
        <SheetContent dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-right text-3xl pt-4">
              {editItem ? "ערוך פריט" : "הוסף פריט"}
            </SheetTitle>
            <SheetDescription className="text-right">
              {editItem
                ? "כאן ניתן לערוך פריט קיים במערכת"
                : "כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <Form {...formControl}>
              <form onSubmit={formControl.handleSubmit(onSubmit)} className="space-y-3 text-right">
                <FormField
                  control={formControl.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם פריט</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            className={cn(
                              "transition-all duration-300 ease-in-out",
                              editItem ? "w-[calc(100%-2.5rem)]" : "w-full"
                            )}
                            placeholder="הכנס פריט כאן..."
                            {...field}
                          />
                          <div
                            className={cn(
                              "overflow-hidden transition-[width] duration-300 ease-in-out flex-shrink-0",
                              editItem ? "w-10" : "w-0"
                            )}
                          >
                            <DeleteButton
                              tip="הסר פריט"
                              onClick={() => removeExtraItem(editItem!)}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  {editItem && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setEditItem(null);
                      }}
                    >
                      בטל
                    </Button>
                  )}
                  <CustomButton
                    title={editItem ? "עדכן" : "שמור"}
                    type="submit"
                    variant="success"
                    className="w-full h-auto"
                  />
                </div>
              </form>
            </Form>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">פריטים נוספים</h3>
              <div className="flex flex-wrap items-center gap-2">
                {extraItems.length === 0 && <div className="text-muted">אין פריטים נוספים</div>}
                {extraItems.map((item) => (
                  <Badge
                    key={item}
                    onClick={() => startEditItem(item)}
                    className="w-fit text-white cursor-pointer inline-flex items-center justify-center py-1 px-2"
                  >
                    <span className="text-center whitespace-nowrap">{item}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ExtraItems;
