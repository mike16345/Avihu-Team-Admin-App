import { ILessonGroup } from "@/interfaces/IBlog";
import { FaLayerGroup, FaPenToSquare, FaTrash } from "react-icons/fa6";
import { getBlogGroupPalette } from "./blogDisplayUtils";

type BlogGroupCardProps = {
  group: ILessonGroup;
  count: number;
  onEdit: (id?: string) => void;
  onDelete: (group: ILessonGroup) => void;
};

const getArticleCountLabel = (count: number) => {
  if (count === 1) return "מאמר";
  return "מאמרים";
};

const BlogGroupCard: React.FC<BlogGroupCardProps> = ({ group, count, onEdit, onDelete }) => {
  const palette = getBlogGroupPalette(group.name);

  return (
    <div className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
        >
          <FaLayerGroup size={18} />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {count} {getArticleCountLabel(count)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{group.name}</h3>
        {group.description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{group.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onEdit(group._id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <FaPenToSquare size={11} />
          עריכה
        </button>
        <button
          type="button"
          onClick={() => onDelete(group)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          aria-label="מחק קבוצה"
        >
          <FaTrash size={11} />
        </button>
      </div>
    </div>
  );
};

export default BlogGroupCard;
