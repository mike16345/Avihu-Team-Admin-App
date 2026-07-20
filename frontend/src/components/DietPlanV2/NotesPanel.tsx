interface NotesPanelProps {
  title: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ title, hint, value, onChange, placeholder }) => (
  <section className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/40 dark:bg-slate-900">
    <header className="mb-2 flex items-baseline justify-between gap-2">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
    </header>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={8}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  </section>
);

export default NotesPanel;
