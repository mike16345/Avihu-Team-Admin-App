import { FaLayerGroup } from "react-icons/fa6";

const BlogGroupsEmptyState = () => (
  <div className="mt-2 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-20 text-center dark:border-slate-800 dark:bg-slate-800/40">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
      <FaLayerGroup size={28} className="text-slate-300 dark:text-slate-600" />
    </div>
    <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">אין קבוצות עדיין</h3>
    <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
      צור קבוצה ראשונה כדי לארגן את המאמרים שלך לקטגוריות.
    </p>
  </div>
);

export default BlogGroupsEmptyState;
