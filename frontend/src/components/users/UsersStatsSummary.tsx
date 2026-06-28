import type { UsersStats } from "./usersPageTypes";

type UsersStatsSummaryProps = {
  stats: UsersStats;
};

const UsersStatsSummary = ({ stats }: UsersStatsSummaryProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="פעילים" value={stats.active} color="text-emerald-600" />
      <StatCard label="משתמשים" value={stats.inOnboarding} color="text-blue-600" />
      <StatCard label="בהקפאה" value={stats.frozen} color="text-cyan-600" />
      <StatCard label="מסתיימים בקרוב " value={stats.endingSoon} color="text-rose-600" />
    </div>
  );
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default UsersStatsSummary;
