import TextEditor from "@/components/ui/TextEditor";

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
    <div className="min-h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <TextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[260px]"
      />
    </div>
  </section>
);

export default NotesPanel;
