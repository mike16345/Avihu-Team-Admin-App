import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import useDeleteLessonGroup from "@/hooks/mutations/lessonGroups/useDeleteLessonGroup";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { toast } from "sonner";
import LessonGroupForm from "../forms/LessonGroupForm";
import { FaArrowRight, FaLayerGroup, FaPenToSquare, FaPlus, FaTrash } from "react-icons/fa6";
import DeleteModal from "../Alerts/DeleteModal";
import { ILessonGroup } from "@/interfaces/IBlog";

interface LessonGroupsSheetProps {
  open: boolean;
  onClose: () => void;
  initialView?: "list" | "create";
  onCreated?: (newGroupName: string) => void;
}

type View = { kind: "list" } | { kind: "form"; id?: string };

const getInitialView = (initialView: LessonGroupsSheetProps["initialView"]): View => {
  if (initialView === "create") return { kind: "form" };
  return { kind: "list" };
};

const getSheetTitle = (view: View) => {
  if (view.kind === "list") return "קבוצות מאמרים";
  if (view.id) return "עריכת קבוצה";
  return "קבוצה חדשה";
};

const getSheetDescription = (view: View) => {
  if (view.kind === "list") {
    return "קבוצות לסיווג המאמרים. גם מופיעות כפילטרים באפליקציית המתאמן.";
  }

  return "השם יופיע גם בצ׳יפים שעל המאמרים.";
};

const getDeleteAlertMessage = (pendingDelete: ILessonGroup | null) => {
  if (!pendingDelete) return undefined;

  return (
    <>
      למחוק את <strong>"{pendingDelete.name}"</strong>? המאמרים בקבוצה זו לא יימחקו — הם פשוט יישארו
      ללא סיווג.
    </>
  );
};

const LessonGroupsSheet: React.FC<LessonGroupsSheetProps> = ({
  open,
  onClose,
  initialView = "list",
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useLessonGroupsQuery();
  const [view, setView] = useState<View>(getInitialView(initialView));
  const [pendingDelete, setPendingDelete] = useState<ILessonGroup | null>(null);
  const [pendingCreatedName, setPendingCreatedName] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setView(getInitialView(initialView));
  }, [open, initialView]);

  useEffect(() => {
    if (!pendingCreatedName || !data?.data) return;
    const found = data.data.find((g) => g.name === pendingCreatedName);
    if (found) {
      onCreated?.(found.name);
      setPendingCreatedName(null);
    }
  }, [data?.data, pendingCreatedName, onCreated]);

  const deleteGroup = useDeleteLessonGroup({
    onSuccess: () => {
      toast.success("הקבוצה נמחקה");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS] });
      setPendingDelete(null);
    },
  });

  const groups = data?.data || [];
  const hasGroups = groups.length > 0;

  const handleFormClose = () => {
    if (view.kind === "form" && !view.id && pendingCreatedName) {
      onClose();
      return;
    }
    setView({ kind: "list" });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          dir="rtl"
          className="w-full overflow-y-auto border-slate-200 bg-white font-heebo dark:border-slate-800 dark:bg-slate-900 sm:max-w-md"
        >
          <SheetHeader className="space-y-1 pb-4 text-right">
            <SheetTitle className="flex items-center gap-2 text-right text-xl font-bold text-slate-900 dark:text-slate-100">
              <FaLayerGroup size={16} className="text-blue-600 dark:text-blue-400" />
              {getSheetTitle(view)}
            </SheetTitle>
            <SheetDescription className="text-right text-xs text-slate-500 dark:text-slate-400">
              {getSheetDescription(view)}
            </SheetDescription>
          </SheetHeader>

          {view.kind === "list" && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setView({ kind: "form" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <FaPlus size={11} />
                קבוצה חדשה
              </button>

              {isLoading && (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">טוען…</p>
              )}
              {!isLoading && !hasGroups && (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  אין קבוצות עדיין
                </p>
              )}
              {!isLoading && hasGroups && (
                <ul className="flex flex-col gap-1.5 pt-2">
                  {groups.map((g) => (
                    <li
                      key={g._id || g.name}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {g.name}
                        </p>
                        {g.description && (
                          <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                            {g.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setView({ kind: "form", id: g._id })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-700"
                        aria-label="ערוך קבוצה"
                      >
                        <FaPenToSquare size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(g)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-600"
                        aria-label="מחק קבוצה"
                      >
                        <FaTrash size={10} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {view.kind === "form" && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setView({ kind: "list" })}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600"
              >
                <FaArrowRight size={10} />
                חזרה לרשימה
              </button>
              <FormShim
                id={view.id}
                onSavedName={(name) => {
                  if (!view.id) setPendingCreatedName(name);
                }}
                onClose={handleFormClose}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <DeleteModal
        isModalOpen={pendingDelete !== null}
        setIsModalOpen={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?._id) deleteGroup.mutate(pendingDelete._id);
        }}
        onCancel={() => setPendingDelete(null)}
        alertMessage={getDeleteAlertMessage(pendingDelete)}
      />
    </>
  );
};

const FormShim: React.FC<{
  id?: string;
  onSavedName?: (name: string) => void;
  onClose: () => void;
}> = ({ id, onSavedName, onClose }) => {
  return (
    <div
      onSubmitCapture={(e) => {
        const target = e.target as HTMLFormElement;
        const nameInput = target.querySelector('input[name="name"]') as HTMLInputElement | null;
        if (nameInput?.value && onSavedName) onSavedName(nameInput.value.trim());
      }}
    >
      <LessonGroupForm objectId={id} closeSheet={onClose} />
    </div>
  );
};

export default LessonGroupsSheet;
