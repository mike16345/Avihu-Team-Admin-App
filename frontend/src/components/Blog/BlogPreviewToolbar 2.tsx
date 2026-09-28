import { FaArrowRight, FaPenToSquare } from "react-icons/fa6";

type BlogPreviewToolbarProps = {
  onBack: () => void;
  onEdit: () => void;
};

const BlogPreviewToolbar: React.FC<BlogPreviewToolbarProps> = ({ onBack, onEdit }) => (
  <div className="flex items-center justify-between gap-3">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
    >
      <FaArrowRight size={11} />
      <span>חזרה למאמרים</span>
    </button>
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
    >
      <FaPenToSquare size={12} />
      ערוך מאמר
    </button>
  </div>
);

export default BlogPreviewToolbar;
