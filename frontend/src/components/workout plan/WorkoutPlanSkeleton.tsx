/**
 * WorkoutPlanSkeleton — loading placeholder for the embedded workout-plan
 * editor.
 *
 * Mirrors the real layout (stats strip → preset card → tabs → workout
 * cards → sticky save bar) so the transition into real content feels
 * instant rather than "page jumped".
 */
import React from "react";

const Bar: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800 ${className}`} />
);

const Card: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const StatCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
    <Bar className="h-10 w-10 rounded-lg" />
    <div className="flex flex-1 flex-col gap-1.5">
      <Bar className="h-2.5 w-20" />
      <Bar className="h-4 w-14" />
    </div>
  </div>
);

const WorkoutRowSkeleton: React.FC = () => (
  <Card>
    <div className="flex items-center gap-3 px-5 py-4">
      <Bar className="h-9 w-9 rounded-xl" />
      <Bar className="h-9 w-40 rounded-xl" />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Bar className="h-5 w-14 rounded-full" />
        <Bar className="h-5 w-20 rounded-full" />
        <Bar className="h-5 w-16 rounded-full" />
      </div>
      <Bar className="hidden h-3 w-28 md:block" />
      <Bar className="h-9 w-9 rounded-xl" />
    </div>
  </Card>
);

const WorkoutPlanSkeleton: React.FC = () => {
  return (
    <div dir="rtl" className="flex w-full flex-col gap-4 font-heebo">
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Preset card */}
      <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <Bar className="h-4 w-32" />
          <Bar className="h-3 w-52" />
        </div>
        <Bar className="h-9 w-full rounded-md sm:w-64" />
      </Card>

      {/* Section tabs */}
      <div className="inline-flex w-fit gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
        <Bar className="h-7 w-20 rounded-full" />
        <Bar className="h-7 w-20 rounded-full" />
        <Bar className="h-7 w-20 rounded-full" />
      </div>

      {/* Workout rows */}
      <div className="flex flex-col gap-3">
        <WorkoutRowSkeleton />
        <WorkoutRowSkeleton />
        <WorkoutRowSkeleton />
      </div>

      {/* Dashed add-workout CTA */}
      <Bar className="h-12 w-full rounded-2xl" />

      {/* Sticky save bar */}
      <Card className="mt-1 flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-end">
        <Bar className="h-10 w-full rounded-xl sm:w-32" />
        <Bar className="h-10 w-full rounded-xl sm:w-32" />
      </Card>
    </div>
  );
};

export default WorkoutPlanSkeleton;
// Re-export the old named symbol so any callers that imported it keep working.
export const WorkoutPlanSkeletonCard = WorkoutPlanSkeleton;
