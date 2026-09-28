import { FaNewspaper, FaPlus } from "react-icons/fa6";

type BlogPageHeaderProps = {
  onCreate: () => void;
};

const BlogPageHeader: React.FC<BlogPageHeaderProps> = ({ onCreate }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/40">
        <FaNewspaper size={20} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">מאמרים</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ניהול תוכן שמופיע במסך המאמרים של אפליקציית המתאמן
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
    >
      <FaPlus size={12} />
      מאמר חדש
    </button>
  </div>
);

export default BlogPageHeader;
