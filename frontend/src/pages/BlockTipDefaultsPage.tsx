import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaCircleCheck, FaPencil } from "react-icons/fa6";
import { useUsersStore } from "@/store/userStore";
import TextEditor from "@/components/ui/TextEditor";

type BlockStatusKey =
  | "normal"
  | "low-intensity"
  | "moderate-intensity"
  | "high-intensity"
  | "peak"
  | "deload";

const STATUS_SLOTS: { id: BlockStatusKey; label: string; hint: string }[] = [
  { id: "normal", label: "אימון רגיל", hint: "ברירת המחדל שתחול על בלוקים ללא סטטוס מוגדר" },
  { id: "low-intensity", label: "עצימות נמוכה", hint: "שבועות התאוששות / החזרה" },
  { id: "moderate-intensity", label: "עצימות בינונית", hint: "אימוני עומס סטנדרטי" },
  { id: "high-intensity", label: "עצימות גבוהה", hint: "אימוני עומס כבד" },
  { id: "peak", label: "שיא (Peak)", hint: "שבועות שיא של המחזור" },
  { id: "deload", label: "דילואוד", hint: "שבוע פריקה מכוונת" },
];

const API_BASE = import.meta.env.VITE_SERVER as string;

const isEmptyHtml = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim().length === 0;

const emptyMap = <T,>(defaultValue: T): Record<BlockStatusKey, T> => ({
  normal: defaultValue,
  "low-intensity": defaultValue,
  "moderate-intensity": defaultValue,
  "high-intensity": defaultValue,
  peak: defaultValue,
  deload: defaultValue,
});

const BlockTipDefaultsPage = () => {
  const currentUser = useUsersStore((s) => s.currentUser);
  const trainerId = currentUser?.trainerId || currentUser?._id;

  const [tips, setTips] = useState<Record<BlockStatusKey, string>>(emptyMap(""));
  const [savedHtml, setSavedHtml] = useState<Record<BlockStatusKey, string>>(emptyMap(""));
  const [editing, setEditing] = useState<Record<BlockStatusKey, boolean>>(emptyMap(true));
  const [saving, setSaving] = useState<BlockStatusKey | undefined>();

  useEffect(() => {
    if (!trainerId) return;
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE}/trainers/block-tip-defaults?trainerId=${trainerId}`
        );
        const j = await r.json();
        const list = j.data?.data ?? j.data ?? [];
        const nextTips = emptyMap("");
        const nextSaved = emptyMap("");
        const nextEditing = emptyMap(true);
        list.forEach((bg: { status: BlockStatusKey; tips: string[] }) => {
          const html = (bg.tips || []).join(" ");
          nextTips[bg.status] = html;
          nextSaved[bg.status] = html;
          if (!isEmptyHtml(html)) nextEditing[bg.status] = false;
        });
        setTips(nextTips);
        setSavedHtml(nextSaved);
        setEditing(nextEditing);
      } catch {}
    })();
  }, [trainerId]);

  const onSave = async (id: BlockStatusKey) => {
    if (!trainerId) return;
    setSaving(id);
    try {
      const html = tips[id];
      const arr = isEmptyHtml(html) ? [] : [html];
      const r = await fetch(`${API_BASE}/trainers/block-tip-defaults`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, status: id, tips: arr }),
      });
      if (!r.ok) throw new Error("save failed");
      setSavedHtml((s) => ({ ...s, [id]: html }));
      if (!isEmptyHtml(html)) setEditing((s) => ({ ...s, [id]: false }));
      toast.success("נשמר");
    } catch {
      toast.error("שמירה נכשלה");
    } finally {
      setSaving(undefined);
    }
  };

  const onClear = async (id: BlockStatusKey) => {
    if (!trainerId) return;
    setSaving(id);
    try {
      await fetch(`${API_BASE}/trainers/block-tip-defaults`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, status: id }),
      });
      setTips((s) => ({ ...s, [id]: "" }));
      setSavedHtml((s) => ({ ...s, [id]: "" }));
      setEditing((s) => ({ ...s, [id]: true }));
      toast.success("נמחק");
    } catch {
      toast.error("מחיקה נכשלה");
    } finally {
      setSaving(undefined);
    }
  };

  const onEdit = (id: BlockStatusKey) => {
    setEditing((s) => ({ ...s, [id]: true }));
  };

  return (
    <div dir="rtl" className="mx-auto max-w-6xl px-4 py-6 font-heebo">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          דגשי ברירת מחדל לבלוקים
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          קבע דגשים אוטומטיים לכל סוג בלוק. כשמאמן יוצר בלוק חדש עם סטטוס מסוים, אם הבלוק ריק מדגשים ישלפו הדגשים כאן כברירת מחדל. חל על כל המתאמנים שלך ו־sub-trainers שתחתיך.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {STATUS_SLOTS.map((slot) => {
          const busy = saving === slot.id;
          const isEditing = editing[slot.id];
          const currentHtml = tips[slot.id];
          const hasSaved = !isEmptyHtml(savedHtml[slot.id]);
          const dirty = currentHtml !== savedHtml[slot.id];

          return (
            <div
              key={slot.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {slot.label}
                    </div>
                    {hasSaved && !dirty && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <FaCircleCheck size={10} />
                        נשמר
                      </span>
                    )}
                    {dirty && hasSaved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        שינוי לא שמור
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400">
                    {slot.hint}
                  </div>
                </div>
              </div>

              {isEditing ? (
                <>
                  <div className="quill-rtl min-h-[200px]">
                    <TextEditor
                      value={currentHtml}
                      onChange={(value) =>
                        setTips((s) => ({ ...s, [slot.id]: value }))
                      }
                    />
                  </div>
                  <div className="mt-14 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onClear(slot.id)}
                      disabled={busy}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    >
                      מחק
                    </button>
                    <button
                      type="button"
                      onClick={() => onSave(slot.id)}
                      disabled={busy}
                      className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busy ? "שומר…" : "שמור"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="ql-editor prose prose-sm max-w-none rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm leading-relaxed text-slate-800 dark:border-emerald-900/40 dark:bg-emerald-950/10 dark:text-slate-200"
                    style={{ minHeight: 200, direction: "rtl", textAlign: "right" }}
                    dangerouslySetInnerHTML={{ __html: savedHtml[slot.id] }}
                  />
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onClear(slot.id)}
                      disabled={busy}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    >
                      מחק
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(slot.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      <FaPencil size={11} />
                      ערוך
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockTipDefaultsPage;
