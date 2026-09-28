import React from "react";

type BlogEditorSectionProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export const BlogEditorSection: React.FC<BlogEditorSectionProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
    </header>
    <div className="p-5">{children}</div>
  </section>
);

export const BlogEditorFieldLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
}> = ({ children, required }) => (
  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {children}
    {required && <span className="ms-1 text-rose-500">*</span>}
  </label>
);
