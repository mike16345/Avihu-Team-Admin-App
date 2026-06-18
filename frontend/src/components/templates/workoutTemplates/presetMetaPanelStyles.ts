export const getPillClassName = (active: boolean) => {
  if (active) {
    return "inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-bold transition-all duration-150 brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/25 -translate-y-px";
  }

  return "inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-bold transition-all duration-150 border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300";
};
