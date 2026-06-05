/**
 * LessonGroupsSheet — inline side-sheet that fully replaces the
 * standalone "/presets/blogs/groups" management page.
 *
 * Two internal views inside one sheet:
 *   1. List   — every group as a row with edit + delete inline
 *      ("+ קבוצה חדשה" sits at the top).
 *   2. Form   — create / edit a single group (re-uses the existing
 *      LessonGroupForm so server validation / mutations stay identical).
 *
 * Open it from anywhere — the BlogPage chip rail or the BlogEditor's
 * group field. No separate route needed; no extra navigation; users
 * stay in the context of what they were editing.
 */
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
import {
  FaArrowRight,
  FaLayerGroup,
  FaPenToSquare,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import DeleteModal from "../Alerts/DeleteModal";
import { ILessonGroup } from "@/interfaces/IBlog";

interface LessonGroupsSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * Optional: when the host (e.g. BlogEditor) wants the user to land
   * directly in the create form, pass "create". Defaults to "list".
   */
  initialView?: "list" | "create";
  /**
   * Optional callback fired after a group is created — the host can use
   * the new group's name to auto-pick it (e.g. in the blog editor's
   * group field).
   */
  onCreated?: (newGroupName: string) => void;
}

type View = { kind: "list" } | { kind: "form"; id?: string };

const LessonGroupsSheet: React.FC<LessonGroupsSheetProps> = ({
  open,
  onClose,
  initialView = "list",
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useLessonGroupsQuery();
  const [view, setView] = useState<View>(
    initialView === "create" ? { kind: "form" } : { kind: "list" }
  );
  const [pendingDelete, setPendingDelete] = useState<ILessonGroup | null>(null);
  const [pendingCreatedName, setPendingCreatedName] = useState<string | null>(null);

  /**
   * Sync internal view with the host's initialView whenever the sheet
   * is (re)opened. Keeps the component reusable across call sites.
   */
  useEffect(() => {
    if (!open) return;
    setView(initialView === "create" ? { kind: "form" } : { kind: "list" });
  }, [open, initialView]);

  /**
   * Watch the lesson groups list: if we just created a new group from
   * the form (we stashed its candidate name), find the matching ID in
   * the refreshed list and notify the host.
   */
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

  /**
   * Wraps the host onCreated callback so we can capture the created
   * name BEFORE the form-level toast invalidates queries. The
   * LessonGroupForm itself calls closeSheet() after success — we'll
   * use that to switch back to the list and to fire the host's
   * onCreated callback once the new group is visible.
   */
  const handleFormClose = () => {
    if (view.kind === "form" && !view.id && pendingCreatedName) {
      // Auto-close the sheet after create (host probably wants to use
      // the new group immediately).
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
          className="w-full overflow-y-auto border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:max-w-md"
          style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        >
          <SheetHeader className="space-y-1 pb-4 text-right">
            <SheetTitle className="flex items-center gap-2 text-right text-xl font-bold text-slate-900 dark:text-slate-100">
              <FaLayerGroup size={16} className="text-blue-600 dark:text-blue-400" />
              {view.kind === "list"
                ? "קבוצות מאמרים"
                : view.id
                ? "עריכת קבוצה"
                : "קבוצה חדשה"}
            </SheetTitle>
            <SheetDescription className="text-right text-xs text-slate-500 dark:text-slate-400">
              {view.kind === "list"
                ? "קבוצות לסיווג המאמרים. גם מופיעות כפילטרים באפליקציית המתאמן."
                : "השם יופיע גם בצ׳יפים שעל המאמרים."}
            </SheetDescription>
          </SheetHeader>

          {view.kind === "list" ? (
            <div className="flex flex-col gap-2">
              {/* Create CTA */}
              <button
                type="button"
                onClick={() => setView({ kind: "form" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <FaPlus size={11} />
                קבוצה חדשה
              </button>

              {/* List */}
              {isLoading ? (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  טוען…
                </p>
              ) : groups.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  אין קבוצות עדיין
                </p>
              ) : (
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
          ) : (
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
                  // Stash the name so onCreated fires when the list refreshes.
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
        alertMessage={
          pendingDelete ? (
            <>
              למחוק את <strong>"{pendingDelete.name}"</strong>? המאמרים בקבוצה זו לא יימחקו —
              הם פשוט יישארו ללא סיווג.
            </>
          ) : undefined
        }
      />
    </>
  );
};

/**
 * Thin shim around LessonGroupForm so we can capture the name the user
 * typed before the form invalidates queries and closes the sheet.
 * We do this by reading the form's name input from the DOM right before
 * close — small but reliable.
 */
const FormShim: React.FC<{
  id?: string;
  onSavedName?: (name: string) => void;
  onClose: () => void;
}> = ({ id, onSavedName, onClose }) => {
  return (
    <div
      onSubmitCapture={(e) => {
        // Grab the value from the form's name input before LessonGroupForm
        // fires its own submit handler.
        const target = e.target as HTMLFormElement;
        const nameInput = target.querySelector('input[name="name"]') as
          | HTMLInputElement
          | null;
        if (nameInput?.value && onSavedName) onSavedName(nameInput.value.trim());
      }}
    >
      <LessonGroupForm objectId={id} closeSheet={onClose} />
    </div>
  );
};

export default LessonGroupsSheet;
