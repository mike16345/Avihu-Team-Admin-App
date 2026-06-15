import { FaArrowRight, FaLayerGroup, FaPlus } from "react-icons/fa6";

type BlogGroupsHeaderProps = {
  onBack: () => void;
  onCreate: () => void;
};

const BlogGroupsHeader: React.FC<BlogGroupsHeaderProps> = ({ onBack, onCreate }) => (
  <>
    <button
      type="button"
      onClick={onBack}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
    >
      <FaArrowRight size={11} />
      <span>חזרה למאמרים</span>
    </button>

    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/40">
          <FaLayerGroup size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ניהול קבוצות</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            קבוצות לסיווג המאמרים. כל קבוצה תופיע גם כפילטר באפליקציית המתאמן.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
      >
        <FaPlus size={12} />
        הוסף קבוצה
      </button>
    </div>
  </>
);

export default BlogGroupsHeader;
