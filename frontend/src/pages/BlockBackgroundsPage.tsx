import { useEffect, useRef, useState } from "react";
import { FaUpload, FaTrash, FaImage } from "react-icons/fa6";
import { toast } from "sonner";
import { useUsersStore } from "@/store/userStore";

type BlockStatusKey =
  | "normal"
  | "low-intensity"
  | "moderate-intensity"
  | "high-intensity"
  | "peak"
  | "deload";

const STATUS_SLOTS: { id: BlockStatusKey; label: string; hint: string }[] = [
  { id: "normal", label: "אימון רגיל", hint: "בלוק ללא סטטוס ייקח את התמונה הזאת" },
  { id: "low-intensity", label: "עצימות נמוכה", hint: "שבועות התאוששות / החזרה" },
  { id: "moderate-intensity", label: "עצימות בינונית", hint: "אימוני עומס סטנדרטי" },
  { id: "high-intensity", label: "עצימות גבוהה", hint: "אימוני עומס כבד" },
  { id: "peak", label: "שיא (Peak)", hint: "שבועות שיא של המחזור" },
  { id: "deload", label: "דילואוד", hint: "שבוע פריקה מכוונת" },
];

const MAX_SIZE_MB = 5;

const API_BASE = import.meta.env.VITE_SERVER as string;

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const BlockBackgroundsPage = () => {
  const currentUser = useUsersStore((s) => s.currentUser);
  const trainerId = currentUser?.trainerId || currentUser?._id;
  const [images, setImages] = useState<Record<BlockStatusKey, string | undefined>>({
    normal: undefined,
    "low-intensity": undefined,
    "moderate-intensity": undefined,
    "high-intensity": undefined,
    peak: undefined,
    deload: undefined,
  });
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState<BlockStatusKey | undefined>();
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!trainerId) return;
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE}/trainers/block-backgrounds?trainerId=${trainerId}`
        );
        const j = await r.json();
        const list = j.data?.data ?? j.data ?? [];
        const next: any = { ...images };
        list.forEach((bg: { status: BlockStatusKey; url: string }) => {
          next[bg.status] = bg.url;
        });
        setImages(next);
      } catch {}
    })();
  }, [trainerId]);

  const onPick = (id: BlockStatusKey) => inputs.current[id]?.click();

  const onFile = async (id: BlockStatusKey, file?: File | null) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`קובץ גדול מדי — מקסימום ${MAX_SIZE_MB}MB`);
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("סוג קובץ לא נתמך — רק JPG / PNG / WebP");
      return;
    }
    setError(undefined);
    setSaving(id);
    try {
      const url = await readAsDataUrl(file);
      const r = await fetch(`${API_BASE}/trainers/block-backgrounds`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, status: id, url }),
      });
      if (!r.ok) throw new Error("save failed");
      setImages((s) => ({ ...s, [id]: url }));
      toast.success("תמונה נשמרה");
    } catch {
      toast.error("שמירה נכשלה");
    } finally {
      setSaving(undefined);
    }
  };

  const onClear = async (id: BlockStatusKey) => {
    setSaving(id);
    try {
      await fetch(`${API_BASE}/trainers/block-backgrounds`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, status: id }),
      });
      setImages((s) => ({ ...s, [id]: undefined }));
      toast.success("תמונה הוסרה");
    } catch {
      toast.error("הסרה נכשלה");
    } finally {
      setSaving(undefined);
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-6xl px-4 py-6 font-heebo">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          עיצוב בלוקים
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          העלה תמונה לכל סוג בלוק. כל המתאמנים שלך (וגם sub-trainers שתחתיך)
          יראו את התמונות האלה ברקע כרטיסי הבלוקים באפליקציה.
        </p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            הנחיות להעלאת תמונה
          </div>
          <ul className="list-disc space-y-1 pr-4 leading-relaxed">
            <li>
              <span className="font-semibold">גודל מומלץ:</span> 1500×500 פיקסלים (יחס 3:1 — רוחב פי 3 מהגובה).
            </li>
            <li>
              <span className="font-semibold">מינימום:</span> 1200×400 פיקסלים. פחות מזה — התמונה תהיה מטושטשת במסכים גדולים.
            </li>
            <li>
              <span className="font-semibold">פורמט:</span> JPG / PNG / WebP · עד 5MB.
            </li>
            <li>
              <span className="font-semibold">גוון כהה מועדף</span> — האפליקציה מוסיפה שכבת שחור־ירוק שקופה עם טקסט לבן מעל התמונה. תמונות בהירות מדי (שמיים כחולים, שלג, רקעים פסטליים) יגרמו לטקסט להיטמע. תמונות כהות/עשירות בקונטרסט (רחוב בלילה, יער כהה, סטודיו בטון) מעניקות מראה מקצועי הרבה יותר.
            </li>
            <li>
              <span className="font-semibold">מקד עניין באמצע התמונה</span> — הפינות עלולות להיחתך במסכים בגודלים שונים.
            </li>
          </ul>
        </div>
        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATUS_SLOTS.map((slot) => {
          const url = images[slot.id];
          const busy = saving === slot.id;
          return (
            <div
              key={slot.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                style={{ aspectRatio: "3 / 1", backgroundColor: "#072723" }}
              >
                {url ? (
                  <>
                    <img
                      src={url}
                      alt={slot.label}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "rgba(7,39,35,0.35)" }}
                    />
                    <div className="absolute top-2 right-3 text-[12px] font-semibold text-white">
                      בלוק — {slot.label}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <FaImage size={22} />
                  </div>
                )}
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                    שומר…
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {slot.label}
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400">
                    {slot.hint}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onPick(slot.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
                  >
                    <FaUpload size={10} />
                    {url ? "החלף" : "העלה"}
                  </button>
                  {url && (
                    <button
                      type="button"
                      onClick={() => onClear(slot.id)}
                      disabled={busy}
                      title="הסר תמונה"
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    >
                      <FaTrash size={10} />
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={(el) => (inputs.current[slot.id] = el)}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => onFile(slot.id, e.target.files?.[0])}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockBackgroundsPage;
