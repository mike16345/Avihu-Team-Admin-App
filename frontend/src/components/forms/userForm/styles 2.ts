export function inputCls(hasError: boolean): string {
  return `w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
      : "border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-200"
  }`;
}
