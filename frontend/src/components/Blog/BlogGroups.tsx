/**
 * BlogGroups — admin page for managing the lesson groups that classify
 * blog articles. Redesigned in the same visual language as BlogPage.
 *
 * Layout:
 *   - In-flow back to /blogs
 *   - Header with icon + title + subtitle + "הוסף קבוצה" CTA
 *   - Card grid: each group as a colored chip card with a count of
 *     articles in it, click to edit, with a small delete button.
 *
 * Logic / API unchanged — still uses useLessonGroupsQuery +
 * useDeleteLessonGroup and the PresetSheet for create/edit.
 */
import { useMemo, useState } from "react";
import useLessonGroupsQuery from "@/hooks/queries/lessonGroups/useLessonGroupsQuery";
import useDeleteLessonGroup from "@/hooks/mutations/lessonGroups/useDeleteLessonGroup";
import PresetSheet from "../templates/PresetSheet";
import TemplateTabsSkeleton from "../ui/skeletons/TemplateTabsSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";
import { toast } from "sonner";
import { ApiResponse } from "@/types/types";
import { ILessonGroup } from "@/interfaces/IBlog";
import useBlogsQuery from "@/hooks/queries/blogs/useBlogsQuery";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaLayerGroup,
  FaPlus,
  FaPenToSquare,
  FaTrash,
} from "react-icons/fa6";
import DeleteModal from "../Alerts/DeleteModal";

const PALETTE: { bg: string; text: string; ring: string }[] = [
  { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-200/60 dark:ring-blue-900/40" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200/60 dark:ring-emerald-900/40" },
  { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", ring: "ring-purple-200/60 dark:ring-purple-900/40" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", ring: "ring-rose-200/60 dark:ring-rose-900/40" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200/60 dark:ring-amber-900/40" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", ring: "ring-cyan-200/60 dark:ring-cyan-900/40" },
];
const paletteFor = (name?: string) => {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

const BlogGroups = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useLessonGroupsQuery();
  const { data: blogPages } = useBlogsQuery();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [lessonGroupId, setLessonGroupId] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<ILessonGroup | null>(null);

  const onSuccess = (lessonGroup: ApiResponse<ILessonGroup>) => {
    toast.success("קבוצה נמחקה בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.LESSON_GROUPS, lessonGroup.data._id] });
    setPendingDelete(null);
  };

  const deleteLessonGroup = useDeleteLessonGroup({ onSuccess });

  const handleEdit = (id?: string) => {
    setLessonGroupId(id);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setLessonGroupId(undefined);
  };

  /**
   * Per-group blog count — derived from the cached blog list so we don't
   * fire any extra requests.
   */
  const blogCountByGroup = useMemo(() => {
    const blogs = blogPages?.pages.flatMap((p) => p.results) ?? [];
    const counts: Record<string, number> = {};
    blogs.forEach((b) => {
      const name = b.group?.name;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [blogPages]);

  if (isLoading) return <TemplateTabsSkeleton />;

  const groups = data?.data || [];

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-5"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <button
        type="button"
        onClick={() => navigate("/blogs")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
      >
        <FaArrowRight size={11} />
        <span>חזרה למאמרים</span>
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
            <FaLayerGroup size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ניהול קבוצות
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              קבוצות לסיווג המאמרים. כל קבוצה תופיע גם כפילטר באפליקציית המתאמן.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleEdit(undefined)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
        >
          <FaPlus size={12} />
          הוסף קבוצה
        </button>
      </div>

      {/* Cards */}
      {groups.length === 0 ? (
        <div className="mt-2 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <FaLayerGroup size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            אין קבוצות עדיין
          </h3>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            צור קבוצה ראשונה כדי לארגן את המאמרים שלך לקטגוריות.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const palette = paletteFor(group.name);
            const count = blogCountByGroup[group.name] || 0;
            return (
              <div
                key={group._id || group.name}
                className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
                  >
                    <FaLayerGroup size={18} />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {count} {count === 1 ? "מאמר" : "מאמרים"}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {group.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(group._id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-300 hover:text-blue-700"
                  >
                    <FaPenToSquare size={11} />
                    עריכה
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(group)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-600"
                    aria-label="מחק קבוצה"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PresetSheet
        id={lessonGroupId}
        isOpen={isSheetOpen}
        onCloseSheet={handleCloseSheet}
        form="lessonGroups"
      />

      <DeleteModal
        isModalOpen={pendingDelete !== null}
        setIsModalOpen={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?._id) deleteLessonGroup.mutate(pendingDelete._id);
        }}
        onCancel={() => setPendingDelete(null)}
        alertMessage={
          pendingDelete ? (
            <>
              האם למחוק את הקבוצה <strong>"{pendingDelete.name}"</strong>?<br />
              {(blogCountByGroup[pendingDelete.name] || 0) > 0 &&
                "המאמרים בקבוצה זו לא יימחקו, אך יישארו ללא סיווג."}
            </>
          ) : undefined
        }
      />
    </div>
  );
};

export default BlogGroups;
