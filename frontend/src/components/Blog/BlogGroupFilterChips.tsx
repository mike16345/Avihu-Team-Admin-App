import { ILessonGroup } from "@/interfaces/IBlog";
import { cn } from "@/lib/utils";
import { FaPlus, FaXmark } from "react-icons/fa6";

type BlogGroupFilterChipsProps = {
  groups: ILessonGroup[];
  selectedGroups: ILessonGroup[];
  onToggleGroup: (group: ILessonGroup) => void;
  onOpenGroups: () => void;
};

const getManageGroupsLabel = (groupsCount: number) => {
  if (groupsCount === 0) return "קבוצה ראשונה";
  return "ערוך קבוצות";
};

const isSelectedGroup = (selectedGroups: ILessonGroup[], group: ILessonGroup) =>
  selectedGroups.some((selectedGroup) => selectedGroup.name === group.name);

const getGroupChipClassName = (active: boolean) => {
  const activeClassName =
    "border-blue-300 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  const inactiveClassName =
    "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-300";

  if (active) {
    return cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
      activeClassName
    );
  }

  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
    inactiveClassName
  );
};

const BlogGroupFilterChips: React.FC<BlogGroupFilterChipsProps> = ({
  groups,
  selectedGroups,
  onToggleGroup,
  onOpenGroups,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="ms-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      קבוצות:
    </span>
    {groups.map((group) => {
      const active = isSelectedGroup(selectedGroups, group);

      return (
        <button
          key={group._id || group.name}
          type="button"
          onClick={() => onToggleGroup(group)}
          className={getGroupChipClassName(active)}
        >
          {group.name}
          {active && <FaXmark size={9} className="opacity-70" />}
        </button>
      );
    })}
    <button
      type="button"
      onClick={onOpenGroups}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
    >
      <FaPlus size={9} />
      {getManageGroupsLabel(groups.length)}
    </button>
  </div>
);

export default BlogGroupFilterChips;
