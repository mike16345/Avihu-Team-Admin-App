import { FC, useState } from "react";
import { Badge } from "../ui/badge";
import { FaTimes, FaEdit } from "react-icons/fa";
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
    onAddItem(updatedItems);
  };

  const startEditItem = (item: string) => {
    setEditItem(item);
    formControl.setValue("name", item);
    setIsSheetOpen(true);
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
            <SheetDescription className="pt-3 text-right">
              {editItem
                ? "כאן ניתן לערוך פריט קיים במערכת"
                : "כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <Form {...formControl}>
              <form onSubmit={formControl.handleSubmit(onSubmit)} className="space-y-4 text-right">
                <FormField
                  control={formControl.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם פריט</FormLabel>
                      <FormControl>
                        <Input placeholder="הכנס פריט כאן..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  {editItem && (
                    <Button className="w-full" onClick={() => setEditItem(null)}>
                      בטל
                    </Button>
                  )}
                  <CustomButton
                    title={editItem ? "עדכן" : "שמור"}
                    type="submit"
                    variant={"success"}
                    className={`h-auto editItem  w-full`}
                  />
                </div>
              </form>
            </Form>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-secondary">פריטים נוספים</h3>
              <div className="flex flex-wrap items-center gap-4">
                {extraItems.length === 0 && <div className="text-muted">אין פריטים נוספים</div>}
                {extraItems.map((item) => (
                  <Badge
                    key={item}
                    className="w-fit text-white cursor-pointer justify-between relative inline-flex items-center  py-1 transition-all duration-300 ease-in-out group "
                  >
                    <div className="flex items-center justify-center w-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:w-6 ">
                      <FaTimes
                        size={14}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        onClick={() => removeExtraItem(item)}
                      />
                    </div>

                    <span className="text-center whitespace-nowrap">{item}</span>

                    <div className="flex items-center justify-center w-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:w-6 ">
                      <FaEdit
                        size={14}
                        className=" text-secondary hover:text-white transition-colors"
                        onClick={() => startEditItem(item)}
                      />
                    </div>
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
