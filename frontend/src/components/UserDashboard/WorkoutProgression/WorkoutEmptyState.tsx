import { FaDumbbell } from "react-icons/fa6";

type WorkoutEmptyStateProps = {
  userFirstName?: string;
};

export function WorkoutEmptyState({ userFirstName }: WorkoutEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-10 text-center">
      <FaDumbbell size={28} className="mx-auto mb-2 text-slate-300" />
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
        אין אימונים מתועדים עדיין
      </h3>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        כאשר {userFirstName || "המתאמן"} יתעד אימון ראשון, הנתונים יופיעו כאן.
      </p>
    </div>
  );
}
