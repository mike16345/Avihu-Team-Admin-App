import { FaArrowRight, FaNewspaper, FaPenToSquare } from "react-icons/fa6";

const getBlogEditorTitle = (isEdit: boolean) => {
  if (isEdit) return "עריכת מאמר";
  return "מאמר חדש";
};

const getBlogEditorSubtitle = (isEdit: boolean) => {
  if (isEdit) {
    return "ערוך את התוכן של המאמר. השינויים יעודכנו באפליקציית המתאמן מיד עם שמירה.";
  }

  return "מלא את הפרטים הבאים כדי לפרסם מאמר חדש לאפליקציה.";
};

const getBlogEditorIcon = (isEdit: boolean) => {
  if (isEdit) return FaPenToSquare;
  return FaNewspaper;
};

const getBlogEditorIconSize = (isEdit: boolean) => {
  if (isEdit) return 18;
  return 20;
};

type BlogEditorHeaderProps = {
  isEdit: boolean;
  onBack: () => void;
};

const BlogEditorHeader: React.FC<BlogEditorHeaderProps> = ({ isEdit, onBack }) => {
  const HeaderIcon = getBlogEditorIcon(isEdit);

  return (
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
            <HeaderIcon size={getBlogEditorIconSize(isEdit)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {getBlogEditorTitle(isEdit)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getBlogEditorSubtitle(isEdit)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogEditorHeader;
